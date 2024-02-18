import process from 'node:process';
import { URL } from 'node:url';
import { hideLinkEmbed } from '@discordjs/builders';
import type InviteCommand from '@thoth/interactions/commands/util/invite';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import i18n from 'i18next';

export default class<Cmd extends typeof InviteCommand> extends Command<Cmd> {
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
		_args: ArgsParam<Cmd>,
		lng: LocaleParam,
	): Promise<void> {
		const url = new URL('https://discord.com/oauth2/authorize');
		url.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID!);
		url.searchParams.set('scope', 'bot applications.commands');
		url.searchParams.set('permissions', this.invitePermissions.toString());

		await interaction.reply(
			i18n.t('commands.invite.success', {
				lng,
				link: hideLinkEmbed(url.toString()),
			}),
		);
	}
}
