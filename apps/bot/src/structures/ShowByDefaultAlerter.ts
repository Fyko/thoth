import { type Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { kSQL } from '#util/symbols.js';

@injectable()
export class ShowByDefaultAlerterModule {
	public constructor(@inject(kSQL) protected readonly sql: Sql<any>) {}

	/**
	 * Checks if a user has been notified that commands will show by default now
	 *
	 * @param userId - The user to check
	 * @returns boolean
	 */
	public async beenAlerted(userId: string): Promise<boolean> {
		const [row] = await this.sql<
			[
				{
					user_id: string;
				}?,
			]
		>`select user_id from public.show_by_default_alert where user_id = ${userId} limit 1`;

		return Boolean(row);
	}

	public async add(userId: string) {
		await this.sql`insert into public.show_by_default_alert (user_id) values (${userId})`;
	}
}
