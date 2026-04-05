import process from 'node:process';
import type { Event } from '@yuudachi/framework/types';
import { stripIndents } from 'common-tags';
import { Client, EmbedBuilder, Events, WebhookClient } from 'discord.js';
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

	public webhook = new WebhookClient({
		url: process.env.GUILD_LOG_WEBHOOK_URL!,
	});

	public execute(): void {
		this.client.on(this.event, async (guild) => {
			const name = guild.name ?? 'Unknown';
			logger.info({ guildId: guild.id }, `Left guild ${name}`);
			if (!guild.available) return; // dear god this is going to be mentioned in my obituary

			this.guildCount.dec();

			void this.webhook.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(name)
						.setThumbnail(guild.iconURL({ size: 512, forceStatic: false }) ?? null)
						.setDescription(
							stripIndents`
							**ID**: \`${guild.id}\`
							**Owner**: ${(await this.client.users.fetch(guild.ownerId)).tag} \`(${guild.ownerId})\`
							**Members**: \`${guild.memberCount?.toLocaleString('en-US') ?? 'Unknown'}\`
						`,
						)
						.setTimestamp()
						.setFooter({ text: 'Left a server' })
						.setColor('DarkRed'),
				],
			});
		});
	}
}
