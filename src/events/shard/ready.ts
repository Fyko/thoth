import process from 'node:process';
import type { Event } from '@yuudachi/framework/types';
import { Client, Events, WebhookClient } from 'discord.js';
import { injectable } from 'tsyringe';
import { logger } from '#logger';

@injectable()
export default class implements Event {
	public name = 'Shard ready handling';

	public event = Events.ShardReady as const;

	public constructor(private readonly client: Client<true>) {}

	public webhook = new WebhookClient({ url: process.env.WEBHOOK_URL! });

	public execute(): void {
		this.client.on(this.event, async (id) => {
			logger.info({ shardId: id }, `Shard ${id} is ready!`);
		});
	}
}
