import { Queue } from 'bullmq';
import type { EventEnvelope } from './events.js';

export type EventsQueue = Queue<EventEnvelope, void, 'event'>;

export function createEventsQueue(connection: { host: string; port: number }): EventsQueue {
	return new Queue<EventEnvelope, void, 'event'>('events', {
		connection,
		defaultJobOptions: {
			removeOnComplete: { count: 100 },
			removeOnFail: { count: 1000 },
			attempts: 5,
			backoff: { type: 'exponential', delay: 1_000 },
		},
	});
}
