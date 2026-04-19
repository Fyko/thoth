import { setTimeout as nodeSetTimeout, clearTimeout as nodeClearTimeout } from 'node:timers';
import type { Job } from 'bullmq';
import { Worker } from 'bullmq';
import type { Logger } from 'pino';
import type { Sql } from 'postgres';
import type { EventEnvelope } from './events.js';

export interface BatcherOptions {
	flush(batch: EventEnvelope[]): Promise<void>;
	maxBatch: number;
	maxWaitMs: number;
}

export class Batcher {
	private buf: EventEnvelope[] = [];

	private timer: NodeJS.Timeout | null = null;

	private flushing: Promise<void> = Promise.resolve();

	public constructor(private readonly opts: BatcherOptions) {}

	public add(envelope: EventEnvelope): void {
		this.buf.push(envelope);
		if (this.buf.length >= this.opts.maxBatch) {
			this.flushing = this.chainFlush();
		} else if (!this.timer) {
			this.timer = nodeSetTimeout(() => {
				this.flushing = this.chainFlush();
			}, this.opts.maxWaitMs);
		}
	}

	public async stop(): Promise<void> {
		if (this.timer) {
			nodeClearTimeout(this.timer);
			this.timer = null;
		}

		this.flushing = this.chainFlush();
		await this.flushing;
	}

	private async chainFlush(): Promise<void> {
		await this.flushing;
		await this.flushNow();
	}

	private async flushNow(): Promise<void> {
		if (this.timer) {
			nodeClearTimeout(this.timer);
			this.timer = null;
		}

		if (this.buf.length === 0) return;
		const batch = this.buf;
		this.buf = [];
		await this.opts.flush(batch);
	}
}

export interface EventsWorkerDeps {
	connection: { host: string; port: number };
	logger: Logger;
	sql: Sql<any>;
}

export function startEventsWorker(deps: EventsWorkerDeps): Worker<EventEnvelope, void, 'event'> {
	const batcher = new Batcher({
		maxBatch: 100,
		maxWaitMs: 1_000,
		flush: async (batch) => {
			try {
				await deps.sql`
          insert into events ${deps.sql(
				batch.map((envelope) => ({
					name: envelope.name,
					user_id: envelope.userId,
					guild_id: envelope.guildId,
					props: envelope.props,
					occurred_at: envelope.occurredAt,
				})),
			)}
        `;
			} catch (error) {
				deps.logger.error({ err: error, batchSize: batch.length }, '[metrics] batch insert failed');
				throw error;
			}
		},
	});

	const worker = new Worker<EventEnvelope, void, 'event'>(
		'events',
		async (job: Job<EventEnvelope>) => {
			batcher.add(job.data);
		},
		{ connection: deps.connection, concurrency: 10 },
	);

	worker.on('closing', () => {
		void batcher.stop();
	});

	return worker;
}
