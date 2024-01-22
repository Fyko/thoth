import { setInterval } from 'node:timers/promises';
import type { Event } from '@yuudachi/framework/types';
import { ActivityType, Client, Events } from 'discord.js';
import { Gauge } from 'prom-client';
import { inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import { kGuildCountGuage } from '#util/symbols.js';

@injectable()
export default class implements Event {
	public name = 'Ready handling';

	public event = Events.ClientReady as const;

	private statusIndex = 0;

	private readonly statuses = [
		'Searching for words...',
		'Did I leave the stove on?',
		'Checking for a new Word of the Day...',
		"What's your favorite word?",
		'Need help? trythoth.com/support',
		'trythoth.com',
	];

	public constructor(
		private readonly client: Client<true>,
		@inject(kGuildCountGuage) private readonly guildCount: Gauge<string>,
	) {}

	public execute(): void {
		this.client.on(this.event, async () => {
			logger.info(`Client is ready! Logged in as ${this.client.user!.tag}`);

			const guilds = this.client.guilds.cache.size;
			this.guildCount.set(guilds);

			for await (const _ of setInterval(60_000, Date.now())) {
				this.statusIndex = this.statusIndex + 1 >= this.statuses.length ? 0 : this.statusIndex + 1;

				const name = this.statuses[this.statusIndex]!;

				this.client.user.setPresence({
					activities: [
						{
							name,
							type: ActivityType.Custom,
						},
					],
				});
			}
		});
	}
}
