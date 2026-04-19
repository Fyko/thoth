import { describe, expect, test } from 'bun:test';
import { Batcher } from '../../src/metrics/worker.js';
import type { EventEnvelope } from '../../src/metrics/events.js';

function env(name: any, props: any = {}): EventEnvelope {
	return { name, userId: 'u', guildId: 'g', props, occurredAt: new Date().toISOString() };
}

describe('Batcher', () => {
	test('flushes when batch size reached', async () => {
		const flushed: EventEnvelope[][] = [];
		const b = new Batcher({
			maxBatch: 3,
			maxWaitMs: 10_000,
			flush: async (batch) => {
				flushed.push(batch);
			},
		});
		b.add(env('guild.left'));
		b.add(env('guild.left'));
		b.add(env('guild.left'));
		await new Promise((r) => setImmediate(r));
		expect(flushed).toHaveLength(1);
		expect(flushed[0]).toHaveLength(3);
		await b.stop();
	});

	test('flushes when wait window elapses', async () => {
		const flushed: EventEnvelope[][] = [];
		const b = new Batcher({
			maxBatch: 100,
			maxWaitMs: 50,
			flush: async (batch) => {
				flushed.push(batch);
			},
		});
		b.add(env('guild.left'));
		await new Promise((r) => setTimeout(r, 100));
		expect(flushed).toHaveLength(1);
		expect(flushed[0]).toHaveLength(1);
		await b.stop();
	});

	test('stop() flushes pending', async () => {
		const flushed: EventEnvelope[][] = [];
		const b = new Batcher({
			maxBatch: 100,
			maxWaitMs: 10_000,
			flush: async (batch) => {
				flushed.push(batch);
			},
		});
		b.add(env('guild.left'));
		b.add(env('guild.left'));
		await b.stop();
		expect(flushed).toHaveLength(1);
		expect(flushed[0]).toHaveLength(2);
	});
});
