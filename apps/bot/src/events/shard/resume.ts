import type { Event } from '@yuudachi/framework/types';
import { Client, Events } from 'discord.js';
import { injectable } from 'tsyringe';
import { logger } from '#logger';

@injectable()
export default class implements Event {
	public name = 'Shard resume handling';

	public event = Events.ShardResume as const;

	public constructor(private readonly client: Client<true>) {}

	public execute(): void {
		this.client.on(this.event, async (id, count) => {
			logger.warn(`Shard ${id} resuming! Replaying ${count} events...`);
		});
	}
}
