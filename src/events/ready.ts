import { logger } from '#logger';
import type { Listener } from '#structures';
import { Client, Constants } from 'discord.js';
import { on } from 'events';
import { injectable } from 'tsyringe';

@injectable()
export default class implements Listener {
	public readonly event = Constants.Events.CLIENT_READY;

	public constructor(public readonly client: Client<true>) {}

	public exec = async (): Promise<void> => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for await (const _ of on(this.client, this.event) as AsyncIterableIterator<[]>) {
			logger.info(`${this.client.user.tag} (${this.client.user.id}) is ready!`);

			continue;
		}
	};
}
