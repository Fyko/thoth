import { Buffer } from 'node:buffer';
import { channelMention } from '@discordjs/builders';
import { CDN } from '@discordjs/rest';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { ChannelType } from 'discord-api-types/v10';
import { Client, PermissionsBitField } from 'discord.js';
import i18n from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { fetch } from 'undici';
import type ConfigCommand from '#interactions/commands/setup/config.js';
import { kSQL, type WOTDConfig } from '#util/index.js';

const cdn = new CDN();

export const wotd = async (
	interaction: InteractionParam,
	args: ArgsParam<typeof ConfigCommand>['wotd'],
	lng: LocaleParam,
): Promise<void> => {
	console.dir(args);
	const client = container.resolve<Client>(Client);
	const sql = container.resolve<Sql<any>>(kSQL);

	// first, we need to check the user permissions
	if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
		throw new Error(i18n.t('common.errors.no_permissions', { lng }));
	}

	// now, we need to fetch the channel
	const channel = await client.channels.fetch(args.channel.id);
	// const channel = (await rest.get(Routes.channel(args.channel))) as APIChannel;
	if (channel?.type !== ChannelType.GuildText) {
		throw new Error(i18n.t('commands.setup.wotd.errors.guild_text_only', { lng }));
	}

	const avatarUrl = cdn.avatar(client.user!.id, client.user!.avatar!, { extension: 'png' });
	const avatar = Buffer.from(await (await fetch(avatarUrl)).arrayBuffer()).toString('base64');
	// const avatar = `data:image/png;base64,${data.toString('base64')}`;

	const webhook = await channel
		.createWebhook({
			name: 'Thoth: Word of the Day',
			avatar,
		})
		.catch(() => null);

	if (!webhook) {
		return void interaction.editReply(
			i18n.t('commands.setup.wotd.errors.no_perms', { lng, channel: channelMention(channel.id) }),
		);
	}

	// now, we need to upsert the webhook into the database
	await sql<[WOTDConfig]>`
		insert into public.wotd (guild_id, created_by, webhook_id, webhook_token)
		values (${channel.guildId!}, ${interaction.member!.user.id}, ${webhook.id}, ${webhook.token})
		on conflict (guild_id)
		do update set webhook_id = ${webhook.id}, webhook_token = ${webhook.token}
	`;

	await interaction.editReply(i18n.t('commands.setup.wotd.success', { lng, channel: channelMention(channel.id) }));
};
