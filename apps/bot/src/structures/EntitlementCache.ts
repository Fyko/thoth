import type { Client } from 'discord.js';
import { injectable } from 'tsyringe';
import { logger } from '#logger';
import type { RedisManager } from './RedisManager.js';

@injectable()
export class EntitlementCache {
	public constructor(private readonly redis: RedisManager) {}

	private redisKey(guildId: string): string {
		return `premium:guild:${guildId}`;
	}

	public async isGuildPremium(guildId: string, client: Client<true>): Promise<boolean> {
		const cached = await this.redis.client.get(this.redisKey(guildId));
		if (cached === '1') return true;
		if (cached === '0') return false;

		try {
			const entitlements = await client.application.entitlements.fetch({
				guild: guildId,
				excludeEnded: true,
			});
			const isPremium = entitlements.some((e) => e.isActive() && e.isGuildSubscription());
			await this.redis.client.set(this.redisKey(guildId), isPremium ? '1' : '0', 'EX', 3_600);
			return isPremium;
		} catch (error) {
			logger.error(error, 'Failed to fetch entitlements for guild');
			return false;
		}
	}

	public async setGuildPremium(guildId: string, premium: boolean): Promise<void> {
		await this.redis.client.set(this.redisKey(guildId), premium ? '1' : '0', 'EX', 3_600);
	}

	public async invalidate(guildId: string): Promise<void> {
		await this.redis.client.del(this.redisKey(guildId));
	}
}
