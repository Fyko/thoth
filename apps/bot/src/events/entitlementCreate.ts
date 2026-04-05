import type { Event } from '@yuudachi/framework/types';
import { Client, Events } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import type { EntitlementCache } from '#structures';
import { kEntitlementCache } from '#util/symbols.js';

@injectable()
export default class implements Event {
	public name = 'Entitlement create';

	public event = Events.EntitlementCreate as const;

	public constructor(
		private readonly client: Client<true>,
		@inject(kEntitlementCache) private readonly cache: EntitlementCache,
	) {}

	public execute(): void {
		this.client.on(this.event, async (entitlement) => {
			if (entitlement.isGuildSubscription() && entitlement.guildId) {
				await this.cache.setGuildPremium(entitlement.guildId, true);
				logger.info({ guildId: entitlement.guildId }, 'Guild subscription created');
			}
		});
	}
}
