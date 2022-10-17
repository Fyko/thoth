import process from 'node:process';
import { URL } from 'node:url';
import { hideLinkEmbed, hyperlink } from '@discordjs/builders';
import type { FastifyReply } from 'fastify';
import type { Command } from '#structures';
import { createResponse } from '#util/respond.js';

const data = {
	name: 'invite',
	description: 'Returns an invite link to add Thoth to your server.',
} as const;

export default class implements Command {
	public readonly data = data;

	public exec = async (res: FastifyReply) => {
		const url = new URL('https://discord.com/oauth2/authorize');
		url.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID!);
		url.searchParams.set('scope', 'bot applications.commands');

		return createResponse(
			res,
			`Want to add Thoth to your server? ${hyperlink('Click here', hideLinkEmbed(url.toString()))}!`,
		);
	};
}
