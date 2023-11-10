import process from 'node:process';
import type { Event } from '@yuudachi/framework/types';
import { Client, Events, WebhookClient } from 'discord.js';
import { injectable } from 'tsyringe';
import { logger } from '#logger';

@injectable()
export default class implements Event {
	public name = 'Debug logging';

	public event = Events.Debug as const;

	public constructor(private readonly client: Client<true>) {}

	public webhook = new WebhookClient({ url: process.env.WEBHOOK_URL! });

	public execute(): void {
		this.client.on(this.event, async (message) => {
			logger.debug(message);
		});
	}
}
