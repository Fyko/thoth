import { oneLine } from 'common-tags';
import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			category: 'client',
			emitter: 'client',
			event: 'ready',
		});
	}

	public exec(): void {
		this.client.logger.info(`[READY] ${this.client.user!.tag} is ready to moderate.`);
		this.client.logger.info(oneLine`[${this.client.user!.tag}]
			${this.client.guilds.cache.size.toLocaleString('en-US')} Guilds,
			${this.client.channels.cache.size.toLocaleString('en-US')} Channels,
			${this.client.guilds.cache.reduce((prev, val) => prev + val.memberCount, 0).toLocaleString('en-US')} Users.
		`);

		void this.client.user!.setActivity(`for @${this.client.user!.tag} help`, { type: 'WATCHING' });
	}
}
