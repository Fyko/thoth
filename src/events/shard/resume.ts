import { Client, Events } from 'discord.js';
import { injectable } from 'tsyringe';
import { logger } from '#logger';
import type { Listener } from '#structures';

@injectable()
export default class implements Listener {
	public readonly event = Events.ShardResume;

	public constructor(public readonly client: Client<true>) {}

	public exec = () => {
		this.client.on(this.event, (id, events) => {
			logger.info(`Shard ${id} resumed with ${events} events replayed!`);
		});
	};
}
