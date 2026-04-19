import process from 'node:process';
import type { Logger } from 'pino';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { logger as defaultLogger } from '#logger';
import { kEventsQueue, kMetricsRingBuffer } from '#util/symbols.js';
import type { EventEnvelope } from './events.js';
import { createEventsQueue, type EventsQueue } from './queue.js';
import { RingBuffer } from './ring-buffer.js';
import { createTrack, type Track } from './track.js';
import { startEventsWorker } from './worker.js';

export type { Track } from './track.js';
export { EventSchemas, type EventName, type EventProps } from './events.js';

let singletonTrack: Track | null = null;

export function track(): Track {
	if (!singletonTrack) throw new Error('metrics not initialized — call setupMetrics() first');
	return singletonTrack;
}

export interface SetupMetricsDeps {
	connection: { host: string; port: number };
	logger?: Logger;
	sql: Sql<any>;
}

export function setupMetrics(deps: SetupMetricsDeps): { queue: EventsQueue } {
	const logger = deps.logger ?? defaultLogger;
	const buffer = new RingBuffer<EventEnvelope>(500);
	const queue = createEventsQueue(deps.connection);

	container.register(kEventsQueue, { useValue: queue });
	container.register(kMetricsRingBuffer, { useValue: buffer });

	singletonTrack = createTrack({
		queue,
		buffer,
		logger,
		isDev: (process.env.NODE_ENV ?? 'development') !== 'production',
	});

	startEventsWorker({ connection: deps.connection, sql: deps.sql, logger });

	return { queue };
}
