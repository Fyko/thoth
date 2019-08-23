import { Listener } from 'discord-akairo';
import { ActivityType, Util } from 'discord.js';
import { oneLine } from 'common-tags';

export interface ReactionStatus {
	text: string;
	type: ActivityType;
}

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			category: 'client',
			emitter: 'client',
			event: 'ready',
		});
	}

	public async exec(): Promise<void> {
		this.client.logger.info(`[READY] ${this.client.user!.tag} is ready to moderate.`);
		this.client.logger.info(oneLine`[${this.client.user!.tag}]
			${this.client.guilds.size.toLocaleString('en-US')} Guilds,
			${this.client.channels.size.toLocaleString('en-US')} Channels,
			${this.client.guilds.reduce((prev, val) => prev + val.memberCount, 0).toLocaleString('en-US')} Users.
		`);

		const activities: ReactionStatus[] = [
			{
				text: `with ${this.client.guilds.reduce((prev, val) => prev + val.memberCount, 0)} Users 👪`,
				type: 'PLAYING',
			},
			{
				text: `${this.client.guilds.size} Guilds 🛡`,
				type: 'WATCHING',
			},
			{
				text: `for @${this.client.user!.tag} help`,
				type: 'WATCHING',
			},
		];

		const statuses = this.infinite(activities);

		this.client.user!.setActivity(statuses.next().value.text, { type: statuses.next().value.type });
		setInterval(() => {
			const status = statuses.next();
			this.client.user!.setActivity(status.value.text, { type: status.value.type });
		}, 30000);
	}

	public *infinite(arr: ReactionStatus[]): any {
		let i = 0;
		while (true) {
			yield arr[i];
			i = (i + 1) % arr.length;
		}
	}
}
