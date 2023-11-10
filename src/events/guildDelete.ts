import process from 'node:process';
import type { Event } from '@yuudachi/framework/types';
import { Client, Events, WebhookClient } from 'discord.js';
import { Gauge } from 'prom-client';
import { inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import { kGuildCountGuage } from '#util/symbols.js';

@injectable()
export default class implements Event {
	public name = 'Guild deletion handling';

	public event = Events.GuildDelete as const;

	public constructor(
		private readonly client: Client<true>,
		@inject(kGuildCountGuage) private readonly guildCount: Gauge<string>,
	) {}

	public webhook = new WebhookClient({ url: process.env.GUILD_LOG_WEBHOOK_URL! });

	public execute(): void {
		this.client.on(this.event, async (guild) => {
			logger.info({ guildId: guild.id }, `Left guild ${guild.name}`);
			this.guildCount.dec();

			this.webhook.send({
				content: `Left guild ${guild.name} (${guild.id})`,
			});
		});
	}
}
