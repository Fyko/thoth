import type { Event } from '@yuudachi/framework/types';
import { Client, Events } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import type { EntitlementCache } from '#structures';
import { kEntitlementCache } from '#util/symbols.js';
import { track } from '../metrics/index.js';

@injectable()
export default class implements Event {
	public name = 'Entitlement delete';

	public event = Events.EntitlementDelete as const;

	public constructor(
		private readonly client: Client<true>,
		@inject(kEntitlementCache) private readonly cache: EntitlementCache,
	) {}

	public execute(): void {
		this.client.on(this.event, async (entitlement) => {
			if (entitlement.guildId) {
				await this.cache.invalidate(entitlement.guildId);
				logger.info({ guildId: entitlement.guildId }, 'Guild entitlement deleted, cache invalidated');
				track().entitlementRevoked(entitlement.userId, entitlement.guildId, {
					skuId: entitlement.skuId,
				});
			}
		});
	}
}
