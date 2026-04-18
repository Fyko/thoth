import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { RingBuffer } from '../../src/metrics/ring-buffer.js';
import { createTrack } from '../../src/metrics/track.js';
import type { EventEnvelope } from '../../src/metrics/events.js';

function makeMockQueue() {
	const adds: { name: string; data: EventEnvelope }[] = [];
	let shouldFail = false;
	return {
		add: mock(async (name: string, data: EventEnvelope) => {
			if (shouldFail) throw new Error('redis down');
			adds.push({ name, data });
		}),
		get adds() {
			return adds;
		},
		set shouldFail(v: boolean) {
			shouldFail = v;
		},
	};
}

describe('track', () => {
	let mockQueue: ReturnType<typeof makeMockQueue>;
	let buffer: RingBuffer<EventEnvelope>;
	let warnings: string[];
	let track: ReturnType<typeof createTrack>;

	beforeEach(() => {
		mockQueue = makeMockQueue();
		buffer = new RingBuffer<EventEnvelope>(500);
		warnings = [];
		track = createTrack({
			queue: mockQueue as any,
			buffer,
			logger: {
				warn: (...args: unknown[]) => {
					warnings.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
				},
			} as any,
			isDev: false,
		});
	});

	test('commandInvoked enqueues a validated envelope', async () => {
		track.commandInvoked('u1', 'g1', { command: 'define', success: true, durationMs: 12 });
		await new Promise((r) => setImmediate(r));
		expect(mockQueue.adds).toHaveLength(1);
		expect(mockQueue.adds[0]!.data.name).toBe('command.invoked');
		expect(mockQueue.adds[0]!.data.userId).toBe('u1');
		expect(mockQueue.adds[0]!.data.guildId).toBe('g1');
	});

	test('validation failure drops event in prod and logs warn', async () => {
		// @ts-expect-error — deliberately invalid payload
		track.commandInvoked('u1', 'g1', { command: 'define' });
		await new Promise((r) => setImmediate(r));
		expect(mockQueue.adds).toHaveLength(0);
		expect(warnings.some((w) => w.includes('command.invoked'))).toBe(true);
	});

	test('validation failure throws in dev', () => {
		track = createTrack({
			queue: mockQueue as any,
			buffer,
			logger: { warn: () => {} } as any,
			isDev: true,
		});
		expect(() =>
			// @ts-expect-error — deliberately invalid payload
			track.commandInvoked('u1', 'g1', { command: 'define' }),
		).toThrow();
	});

	test('enqueue failure pushes to ring buffer', async () => {
		mockQueue.shouldFail = true;
		track.guildLeft(null, 'g1', {});
		await new Promise((r) => setImmediate(r));
		expect(buffer.size()).toBe(1);
	});

	test('ring buffer drains on next successful enqueue', async () => {
		mockQueue.shouldFail = true;
		track.guildLeft(null, 'g1', {});
		await new Promise((r) => setImmediate(r));
		expect(buffer.size()).toBe(1);

		mockQueue.shouldFail = false;
		track.commandInvoked('u2', 'g2', { command: 'x', success: true, durationMs: 1 });
		await new Promise((r) => setImmediate(r));
		expect(buffer.size()).toBe(0);
		expect(mockQueue.adds.length).toBeGreaterThanOrEqual(2);
	});
});
