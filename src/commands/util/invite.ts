import process from 'node:process';
import { URL } from 'node:url';
import { hideLinkEmbed } from '@discordjs/builders';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import i18n from 'i18next';
import type InviteCommand from '#interactions/commands/util/invite.js';

export default class extends Command<typeof InviteCommand> {
	private readonly invitePermissions =
		PermissionFlagsBits.ManageWebhooks |
		PermissionFlagsBits.ViewChannel |
		PermissionFlagsBits.SendMessages |
		PermissionFlagsBits.EmbedLinks |
		PermissionFlagsBits.AttachFiles |
		PermissionFlagsBits.AddReactions |
		PermissionFlagsBits.UseExternalEmojis;

	public override async chatInput(
		interaction: InteractionParam,
		_args: ArgsParam<typeof InviteCommand>,
		lng: LocaleParam,
	): Promise<void> {
		const url = new URL('https://discord.com/oauth2/authorize');
		url.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID!);
		url.searchParams.set('scope', 'bot applications.commands');
		url.searchParams.set('permissions', this.invitePermissions.toString());

		await interaction.reply(i18n.t('commands.invite.response', { lng, link: hideLinkEmbed(url.toString()) }));
	}
}
