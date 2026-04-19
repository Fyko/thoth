import type { Logger } from 'pino';
import type { Sql } from 'postgres';

export async function runRetention(sql: Sql<any>, logger: Logger): Promise<number> {
	const res = await sql`
    delete from events where occurred_at < now() - interval '180 days'
  `;
	const deleted = res.count ?? 0;
	logger.info({ deleted }, '[metrics] retention sweep complete');
	return deleted;
}
