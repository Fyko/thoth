import { Client, Events } from 'discord.js';
import { injectable } from 'tsyringe';
import { logger } from '#logger';
import type { Listener } from '#structures';

@injectable()
export default class implements Listener {
	public readonly event = Events.ShardReady;

	public constructor(public readonly client: Client<true>) {}

	public exec = () => {
		this.client.on(this.event, (id, unavail) => {
			logger.info(`Shard ${id} ready${unavail ? ` with ${unavail.size} unavailable guilds` : ''}!`);
		});
	};
}
