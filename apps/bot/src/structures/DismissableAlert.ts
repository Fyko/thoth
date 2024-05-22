import { type Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { kSQL } from '#util/symbols.js';

@injectable()
export class DismissableAlertModule {
	public constructor(@inject(kSQL) protected readonly sql: Sql<any>) {}

	/**
	 * Checks if a user has been notified that commands will show by default now
	 *
	 * @param userId - The user to check
	 * @returns boolean
	 */
	public async beenAlerted(userId: string, campaign: string): Promise<boolean> {
		const [row] = await this.sql<
			[
				{
					user_id: string;
				}?,
			]
		>`select user_id from public.dismissable_alert where user_id = ${userId} and campaign = ${campaign} limit 1`;

		return Boolean(row);
	}

	public async add(userId: string, campaign: string): Promise<void> {
		await this.sql`insert into public.dismissable_alert (user_id, campaign) values (${userId}, ${campaign})`;
	}
}
