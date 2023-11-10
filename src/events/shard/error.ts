import type { Event } from '@yuudachi/framework/types';
import { Client, Events } from 'discord.js';
import { injectable } from 'tsyringe';
import { logger } from '#logger';

@injectable()
export default class implements Event {
	public name = 'Shard error handling';

	public event = Events.ShardError as const;

	public constructor(private readonly client: Client<true>) {}

	public execute(): void {
		this.client.on(this.event, async (error, id) => {
			logger.error(error, `Shard ${id} errored!`);
		});
	}
}
