import { channelMention } from '@discordjs/builders';
import { CDN } from '@discordjs/rest';
import type { APIChannel, APIInteraction, APIUser, RESTPostAPIChannelWebhookJSONBody, RESTPostAPIChannelWebhookResult} from 'discord-api-types/v10';
import { ChannelType, Routes } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import type { REST } from '#structures';
import { Permissions } from '#util/constants.js';
import { kBotUser, kREST, kSQL, type WOTDConfig } from '#util/index.js';
import { createResponse } from '#util/respond.js';

const cdn = new CDN();

export const wotd = async (res: FastifyReply, interaction: APIInteraction, args: { channel: string }, lng: string) => {
	console.dir(args)
	const rest = container.resolve<REST>(kREST);
	const bot = container.resolve<APIUser>(kBotUser);
	const sql = container.resolve<Sql<any>>(kSQL);

	// first, we need to check the user permissions
	const hasManage = Permissions.has(BigInt(interaction.member!.permissions), Permissions.flags.ManageChannels);
	if (!hasManage) {
		return createResponse(res, i18n.t('common.errors.no_permissions', { lng }), true);
	}

	// now, we need to fetch the channel
	const channel = (await rest.get(Routes.channel(args.channel))) as APIChannel;
	if (channel.type !== ChannelType.GuildText) {
		return createResponse(res, i18n.t('commands.setup.wotd.errors.guild_text_only', { lng }), true);
	}

	// instead of checking if we have perms to create a webhook, we'll just try to create one
	// if we don't have perms, discord will return an error
	const webhook = await (rest.post(Routes.channelWebhooks(channel.id), {
		body: {
			name: 'Thoth: Word of the Day',
			avatar: cdn.avatar(bot.id, bot.avatar!),
		} as RESTPostAPIChannelWebhookJSONBody,
	}).catch(() => null)) as RESTPostAPIChannelWebhookResult | null;

	if (!webhook) {
		return createResponse(res, i18n.t('commands.setup.wotd.errors.no_perms', { lng, channel: channelMention(channel.id) }), true);
	}

	// now, we need to upsert the webhook into the database
	await sql<[WOTDConfig]>`
		INSERT INTO public.wotd (guild_id, created_by, webhook_id, webhook_token)
		VALUES (${channel.guild_id!}, ${interaction.member!.user.id}, ${webhook.id}, ${webhook.token})
		ON CONFLICT (guild_id)
		DO UPDATE SET webhook_id = ${webhook.id}, webhook_token = ${webhook.token}
	`;

	return createResponse(res, i18n.t('commands.setup.wotd.success', { lng, channel: channelMention(channel.id) }));
}
