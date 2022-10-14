import { URL } from 'node:url';
import { hideLinkEmbed, hyperlink } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import type { Command } from '#structures';

const data = {
	name: 'invite',
	description: 'Returns an invite link to add Thoth to your server.',
} as const;

export default class implements Command {
	public readonly data = data;

	public exec = async (interaction: CommandInteraction) => {
		const url = new URL('https://discord.com/oauth2/authorize');
		url.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID!);
		url.searchParams.set('scope', 'bot applications.commands');

		return interaction.reply({
			content: `Want to add Thoth to your server? ${hyperlink('Click here', hideLinkEmbed(url.toString()))}!`,
		});
	};
}
