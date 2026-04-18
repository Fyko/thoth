import type { Queue } from 'bullmq';
import type { Logger } from 'pino';
import type { Sql } from 'postgres';

export async function registerRetentionJob(queue: Queue<any, any, string>): Promise<void> {
	await queue.add('events-retention', {}, { repeat: { pattern: '0 3 * * *' }, removeOnComplete: { count: 30 } });
}

export async function runRetention(sql: Sql<any>, logger: Logger): Promise<number> {
	const res = await sql`
    delete from events where occurred_at < now() - interval '180 days'
  `;
	const deleted = res.count ?? 0;
	logger.info({ deleted }, '[metrics] retention sweep complete');
	return deleted;
}
