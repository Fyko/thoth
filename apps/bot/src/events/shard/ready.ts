import { setInterval } from 'node:timers/promises';
import type { Event } from '@yuudachi/framework/types';
import { ActivityType, Client, Events } from 'discord.js';
import { injectable } from 'tsyringe';
import { logger } from '#logger';

@injectable()
export default class implements Event {
	public name = 'Shard ready handling';

	public event = Events.ShardReady as const;

	private statusIndex = 0;

	private readonly statuses = [
		'Searching for words...',
		'Did I leave the stove on?',
		'Checking for a new Word of the Day...',
		"What's your favorite word?",
		'Need help? trythoth.com/support',
		'trythoth.com',
	];

	public constructor(private readonly client: Client<true>) {}

	public execute(): void {
		this.client.on(this.event, async (id) => {
			logger.info({ shardId: id }, `Shard ${id} is ready!`);

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
					shardId: id,
				});
			}
		});
	}
}
