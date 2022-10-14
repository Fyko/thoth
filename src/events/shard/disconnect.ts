import { Client, Events } from 'discord.js';
import { injectable } from 'tsyringe';
import { logger } from '#logger';
import type { Listener } from '#structures';

@injectable()
export default class implements Listener {
	public readonly event = Events.ShardDisconnect;

	public constructor(public readonly client: Client<true>) {}

	public exec = () => {
		this.client.on(this.event, ({ code, reason }, id) => {
			logger.error(`Shard ${id} disconnected with code ${code} and reason ${reason}!`);
		});
	};
}
