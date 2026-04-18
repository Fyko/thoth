import type { Logger } from 'pino';
import type { EventEnvelope, EventName, EventProps } from './events.js';
import { validateEvent } from './events.js';
import type { EventsQueue } from './queue.js';
import type { RingBuffer } from './ring-buffer.js';

export interface TrackDeps {
	queue: EventsQueue;
	buffer: RingBuffer<EventEnvelope>;
	logger: Pick<Logger, 'warn'>;
	isDev: boolean;
}

type TrackFn<N extends EventName> = (userId: string | null, guildId: string | null, props: EventProps<N>) => void;

export type Track = {
	commandInvoked: TrackFn<'command.invoked'>;
	buttonClicked: TrackFn<'button.clicked'>;
	modalSubmitted: TrackFn<'modal.submitted'>;
	guildJoined: TrackFn<'guild.joined'>;
	guildLeft: TrackFn<'guild.left'>;
	wotdDelivered: TrackFn<'wotd.delivered'>;
	wotdQuizAttempted: TrackFn<'wotd.quiz_attempted'>;
	entitlementChecked: TrackFn<'entitlement.checked'>;
	entitlementGranted: TrackFn<'entitlement.granted'>;
	entitlementRevoked: TrackFn<'entitlement.revoked'>;
	feedbackSubmitted: TrackFn<'feedback.submitted'>;
};

const METHOD_TO_EVENT: Record<keyof Track, EventName> = {
	commandInvoked: 'command.invoked',
	buttonClicked: 'button.clicked',
	modalSubmitted: 'modal.submitted',
	guildJoined: 'guild.joined',
	guildLeft: 'guild.left',
	wotdDelivered: 'wotd.delivered',
	wotdQuizAttempted: 'wotd.quiz_attempted',
	entitlementChecked: 'entitlement.checked',
	entitlementGranted: 'entitlement.granted',
	entitlementRevoked: 'entitlement.revoked',
	feedbackSubmitted: 'feedback.submitted',
};

export function createTrack(deps: TrackDeps): Track {
	const emit = <N extends EventName>(
		name: N,
		userId: string | null,
		guildId: string | null,
		props: EventProps<N>,
	) => {
		const result = validateEvent(name, props);
		if (!result.success) {
			if (deps.isDev) {
				throw new Error(`[metrics] invalid props for ${name}: ${result.error}`);
			}
			deps.logger.warn({ name, error: result.error }, `[metrics] invalid props for ${name}`);
			return;
		}

		const envelope: EventEnvelope<N> = {
			name,
			userId,
			guildId,
			props,
			occurredAt: new Date().toISOString(),
		};

		void enqueue(deps, envelope);
	};

	const track = {} as Track;
	for (const [method, eventName] of Object.entries(METHOD_TO_EVENT) as [keyof Track, EventName][]) {
		(track as any)[method] = (userId: string | null, guildId: string | null, props: unknown) =>
			emit(eventName, userId, guildId, props as any);
	}
	return track;
}

async function enqueue(deps: TrackDeps, envelope: EventEnvelope): Promise<void> {
	try {
		await deps.queue.add('event', envelope);
		// drain any previously-buffered events now that the queue is up
		const buffered = deps.buffer.drain();
		for (const buf of buffered) {
			try {
				await deps.queue.add('event', buf);
			} catch {
				// requeue on failure; we tried our best
				deps.buffer.push(buf);
			}
		}
	} catch (error) {
		deps.buffer.push(envelope);
		deps.logger.warn({ err: error, bufferSize: deps.buffer.size() }, '[metrics] enqueue failed, buffered');
	}
}
