import type { Event } from '@yuudachi/framework/types';
import { Client, Events } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import type { EntitlementCache } from '#structures';
import { kEntitlementCache } from '#util/symbols.js';
import { track } from '../metrics/index.js';

@injectable()
export default class implements Event {
	public name = 'Entitlement update';

	public event = Events.EntitlementUpdate as const;

	public constructor(
		private readonly client: Client<true>,
		@inject(kEntitlementCache) private readonly cache: EntitlementCache,
	) {}

	public execute(): void {
		this.client.on(this.event, async (_oldEntitlement, newEntitlement) => {
			if (newEntitlement.guildId) {
				await this.cache.invalidate(newEntitlement.guildId);
				logger.info({ guildId: newEntitlement.guildId }, 'Guild entitlement updated, cache invalidated');
				track().entitlementGranted(newEntitlement.userId, newEntitlement.guildId, {
					skuId: newEntitlement.skuId,
				});
			}
		});
	}
}
