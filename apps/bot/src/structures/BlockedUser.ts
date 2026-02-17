import { setInterval, clearInterval } from 'node:timers';
import { Client, type Snowflake, type UserResolvable } from 'discord.js';
import { type Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { kSQL } from '#util/symbols.js';

export type Reason = string;

@injectable()
export class BlockedUserModule {
	private readonly _interval: NodeJS.Timeout;

	public bans: Map<Snowflake, Reason> = new Map();

	public constructor(
		@inject(kSQL) protected readonly sql: Sql<any>,
		@inject(Client) protected readonly client: Client,
	) {
		void this.refresh();
		this._interval = setInterval(this.refresh.bind(this), 60_000);
	}

	/**
	 * Checks if a user is blocked
	 *
	 * @param user - The user to check
	 * @returns boolean
	 */
	public check(user: UserResolvable): Reason | undefined {
		const id = this.client.users.resolveId(user);
		if (id === null) throw new Error('User not found');

		return this.bans.get(id);
	}

	public async add(user_id: Snowflake, reason: string) {
		await this.sql`insert into public.thoth_bans (user_id, reason) values (${user_id}, ${reason})`;

		this.bans.set(user_id, reason);
	}

	public async remove(user_id: Snowflake) {
		await this.sql`delete from public.thoth_bans where user_id = ${user_id}`;
		this.bans.delete(user_id);
	}

	private async refresh() {
		const user_ids = await this.sql<{ reason: Reason; user_id: Snowflake }[]>`
			select user_id, reason from public.thoth_bans;
		`;

		this.bans = new Map(user_ids.map(({ user_id, reason }) => [user_id, reason]));
	}

	public destroy() {
		clearInterval(this._interval);
	}
}
