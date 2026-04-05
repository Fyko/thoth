import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { kSQL } from '#util/symbols.js';

export interface FeedbackRow {
	channel_id?: string;
	created_at: Date;
	description: string;
	id: string;
	subject: string;
	thread_id?: string;
	type: 'bug' | 'feature' | 'general';
	user_id: string;
}

export async function fetchFeedbackRow(id: string): Promise<FeedbackRow | null> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const rows = await sql<[FeedbackRow]>`
		select
			id,
			type,
			subject,
			description,
			user_id,
			channel_id,
			thread_id,
			created_at
		from
			feedback_submission
		where
			id = ${id}
	`;

	return rows[0] ?? null;
}
