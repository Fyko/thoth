import type { Command } from '#structures';
import { Colors } from '#util/constants';
import { localize } from '#util/index';
import { inlineCode, underscore } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import ms from 'pretty-ms';

const data = {
	name: 'stats',
	description: 'Returns statistics on the bot.',
} as const;

export default class implements Command {
	public readonly again = new Map<string, NodeJS.Timeout>();

	public readonly data = data;

	private readonly ms = (value: number, verbose = true) => ms(value, { secondsDecimalDigits: 0, verbose });

	public exec = (interaction: CommandInteraction): Promise<void> => {
		const client = interaction.client;

		const guilds = client.guilds.cache.size;
		const channels = client.channels.cache.size;
		const users = client.guilds.cache.reduce((prev, { memberCount }) => prev + memberCount, 0);

		const embed = new MessageEmbed()
			.setColor(Colors.Primary)
			.setThumbnail(client.user!.displayAvatarURL({ size: 2048, dynamic: true }))
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
