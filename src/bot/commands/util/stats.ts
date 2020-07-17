import { stripIndents } from 'common-tags';
import { Command, version as akairoVersion } from 'discord-akairo';
import { Message, version as djsVersion } from 'discord.js';
import os from 'os';
import prettyMS from 'pretty-ms';
import { codeb, localize } from '../../util';

export default class StatsCommand extends Command {
	public constructor() {
		super('stats', {
			aliases: ['stats'],
			description: {
				content: 'Provides statistics relating to the bot.',
			},
			category: 'utilities',
		});
	}

	private readonly ms = (value: number, verbose = true) => prettyMS(value, { secondsDecimalDigits: 0, verbose });

	public async exec(msg: Message): Promise<Message | Message[] | void> {
		const guilds = this.client.guilds.cache.size;
		const channels = this.client.channels.cache.size;
		const users = this.client.guilds.cache.reduce((prev, { memberCount }) => prev + memberCount, 0);

		const embed = this.client.util
			.embed()
			.setColor(msg.guild?.me?.displayColor ?? this.client.config.color)
			.setThumbnail(this.client.user!.displayAvatarURL({ size: 2048, dynamic: true }))
			.setTitle(`${this.client.user?.username}'s Statistics`)
			.addField(
				'Discord Data',
				`
				• Guilds: ${codeb(localize(guilds))}
				• Channels: ${codeb(localize(channels))}
				• Users: ${codeb(localize(users))}
			`,
			)
			.addField(
				'Uptime',
				stripIndents`
				• Host: ${this.ms(os.uptime())} (${codeb(os.hostname())})
				• Client: ${this.ms(this.client.uptime!)}
			`,
			)
			.addField(
				'Server Usage',
				stripIndents`
				• Process Memory: ${codeb(`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`)}
			`,
			)
			.addField(
				'Core Dependencies',
				stripIndents`
				• [Discord.js](https://discord.js/org) (Discord API Library): ${codeb(`v${djsVersion}`)}
				• [Discord Akairo](https://discord-akairo.github.io/) (Command Framework): ${codeb(`v${akairoVersion}`)}
			`,
			);

		return msg.util?.send({ embed });
	}
}
