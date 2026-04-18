import type { Job } from 'bullmq';
import { Worker } from 'bullmq';
import type { Sql } from 'postgres';
import type { Logger } from 'pino';
import type { EventEnvelope } from './events.js';

export interface BatcherOptions {
	maxBatch: number;
	maxWaitMs: number;
	flush: (batch: EventEnvelope[]) => Promise<void>;
}

export class Batcher {
	private buf: EventEnvelope[] = [];
	private timer: NodeJS.Timeout | null = null;
	private flushing: Promise<void> = Promise.resolve();

	constructor(private readonly opts: BatcherOptions) {}

	add(e: EventEnvelope): void {
		this.buf.push(e);
		if (this.buf.length >= this.opts.maxBatch) {
			this.flushing = this.flushing.then(() => this.flushNow());
		} else if (!this.timer) {
			this.timer = setTimeout(() => {
				this.flushing = this.flushing.then(() => this.flushNow());
			}, this.opts.maxWaitMs);
		}
	}

	async stop(): Promise<void> {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.flushing = this.flushing.then(() => this.flushNow());
		await this.flushing;
	}

	private async flushNow(): Promise<void> {
		if (this.timer) {
			clearTimeout(this.timer);
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
	sql: Sql<any>;
	logger: Logger;
}

export function startEventsWorker(deps: EventsWorkerDeps): Worker<EventEnvelope, void, 'event'> {
	const batcher = new Batcher({
		maxBatch: 100,
		maxWaitMs: 1_000,
		flush: async (batch) => {
			try {
				await deps.sql`
          insert into events ${deps.sql(
				batch.map((e) => ({
					name: e.name,
					user_id: e.userId,
					guild_id: e.guildId,
					props: e.props,
					occurred_at: e.occurredAt,
				})),
			)}
        `;
			} catch (err) {
				deps.logger.error({ err, batchSize: batch.length }, '[metrics] batch insert failed');
				throw err;
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
