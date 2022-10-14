import { inlineCode, underscore } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import type { CommandInteraction} from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import ms from 'pretty-ms';
import type { Command } from '#structures';
import { Colors } from '#util/constants';
import { localize } from '#util/index';

const data = {
	name: 'stats',
	description: 'Returns statistics on the bot.',
} as const;

export default class implements Command {
	public readonly again = new Map<string, NodeJS.Timeout>();

	public readonly data = data;

	private readonly ms = (value: number, verbose = true) => ms(value, { secondsDecimalDigits: 0, verbose });

	public exec = async (interaction: CommandInteraction) => {
		const client = interaction.client;

		const guilds = client.guilds.cache.size;
		const channels = client.channels.cache.size;
		const users = client.guilds.cache.reduce((prev, { memberCount }) => prev + memberCount, 0);

		const embed = new EmbedBuilder()
			.setColor(Colors.Primary)
			.setThumbnail(client.user!.displayAvatarURL({ size: 2_048  }))
			.setTitle(`${client.user?.username}'s Statistics`).setDescription(stripIndents`
				${underscore('Discord Data')}
				• Guilds: ${inlineCode(localize(guilds))}
				• Channels: ${inlineCode(localize(channels))}
				• Users: ${inlineCode(localize(users))}

				Uptime: ${this.ms(client.uptime!)}
			`);

		return interaction.reply({ embeds: [embed] });
	};
}
