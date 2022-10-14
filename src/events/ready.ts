import { Client, Events } from 'discord.js';
import { injectable } from 'tsyringe';
import { logger } from '#logger';
import type { Listener } from '#structures';

@injectable()
export default class implements Listener {
	public readonly event = Events.ClientReady;

	public constructor(public readonly client: Client<true>) {}

	public exec = () => {
		this.client.on(this.event, () => {
			logger.info(`${this.client.user.tag} (${this.client.user.id}) is ready!`);
		});
	};
}
