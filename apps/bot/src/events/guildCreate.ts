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
	public name = 'Guild creation handling';

	public event = Events.GuildCreate as const;

	public constructor(
		private readonly client: Client<true>,
		@inject(kGuildCountGuage) private readonly guildCount: Gauge<string>,
	) {}

	public webhook = new WebhookClient({
		url: process.env.GUILD_LOG_WEBHOOK_URL!,
	});

	public execute(): void {
		this.client.on(this.event, async (guild) => {
			logger.info({ guildId: guild.id }, `Joined guild ${guild.name}`);
			this.guildCount.inc();

			void this.webhook.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(guild.name)
						.setThumbnail(guild.iconURL({ size: 512, forceStatic: false }) ?? null)
						.setDescription(
							stripIndents`
							**ID**: \`${guild.id}\`
							**Owner**: ${(await guild.fetchOwner()).user.tag} \`(${guild.ownerId})\`
							**Members**: \`${guild.memberCount.toLocaleString('en-US')}\`
						`,
						)
						.setTimestamp()
						.setFooter({ text: 'Joined a server' })
						.setColor('DarkGreen'),
				],
			});
		});
	}
}
