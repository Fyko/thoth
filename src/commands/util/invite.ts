import process from 'node:process';
import { URL } from 'node:url';
import { hideLinkEmbed } from '@discordjs/builders';
import type { APIInteraction } from 'discord-api-types/v10';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import InviteCommand from '#interactions/commands/util/invite.js';
import type { Command } from '#structures';
import { createResponse } from '#util/respond.js';

export default class implements Command {
	public readonly data = InviteCommand;

	private readonly invitePermissions =
		PermissionFlagsBits.ManageWebhooks |
		PermissionFlagsBits.ViewChannel |
		PermissionFlagsBits.SendMessages |
		PermissionFlagsBits.EmbedLinks |
		PermissionFlagsBits.AttachFiles |
		PermissionFlagsBits.AddReactions |
		PermissionFlagsBits.UseExternalEmojis;

	public exec = async (res: FastifyReply, _: APIInteraction, lng: string) => {
		const url = new URL('https://discord.com/oauth2/authorize');
		url.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID!);
		url.searchParams.set('scope', 'bot applications.commands');
		url.searchParams.set('permissions', this.invitePermissions.toString());

		return createResponse(res, i18n.t('commands.invite.response', { lng, link: hideLinkEmbed(url.toString()) }));
	};
}
