import process from 'node:process';
import { channelMention } from '@discordjs/builders';
import { CDN } from '@discordjs/rest';
import type ConfigCommand from '@thoth/interactions/commands/setup/config';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { stripIndents } from 'common-tags';
import { ButtonStyle, ChannelType } from 'discord-api-types/v10';
import { ActionRowBuilder, ButtonBuilder, Client, PermissionsBitField } from 'discord.js';
import i18n from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { logger } from '#logger';
import { CommandError } from '#util/error.js';
import { kSQL, type WOTDConfig } from '#util/index.js';
import { track } from '../../../metrics/index.js';

const cdn = new CDN();

const validTimezones = new Set(Intl.supportedValuesOf('timeZone'));

/**
 * Parse a time string into HH:MM:SS format.
 * Accepts: "3:00 PM", "3PM", "3:30pm", "15:00", "1500", "9:00 AM"
 */
function parseTime(input: string): string | null {
	const normalized = input.trim().toUpperCase();

	// 12-hour format: "3:00 PM", "3PM", "3:30 PM", "12:00AM"
	const match12 = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i.exec(normalized);
	if (match12) {
		let hour = Number.parseInt(match12[1]!, 10);
		const minute = match12[2] ? Number.parseInt(match12[2], 10) : 0;
		const period = match12[3]!;

		if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;

		if (period === 'AM' && hour === 12) hour = 0;
		if (period === 'PM' && hour !== 12) hour += 12;

		return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
	}

	// 24-hour format: "15:00", "1500", "9:00", "09:30"
	const match24 = /^(\d{1,2}):?(\d{2})$/.exec(normalized);
	if (match24) {
		const hour = Number.parseInt(match24[1]!, 10);
		const minute = Number.parseInt(match24[2]!, 10);

		if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

		return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
	}

	return null;
}

export const wotd = async (
	interaction: InteractionParam,
	args: ArgsParam<typeof ConfigCommand>['wotd'],
	lng: LocaleParam,
): Promise<void> => {
	const timeArg = (args as any).time as string | undefined;
	const timezoneArg = (args as any).timezone as string | undefined;

	// premium gate — respond with upsell button before deferring
	if (timeArg || timezoneArg) {
		const hasEntitlement = interaction.entitlements.some((entitlement) => entitlement.isActive());
		track().entitlementChecked(interaction.user.id, interaction.guildId, {
			kind: 'premium',
			granted: hasEntitlement,
			site: 'wotd_setup',
		});
		if (!hasEntitlement) {
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setSKUId(process.env.DISCORD_PREMIUM_SKU_ID).setStyle(ButtonStyle.Premium),
			);
			return void interaction.reply({
				content: 'Custom WOTD scheduling is a **Thoth Pro** feature.',
				components: [row],
				ephemeral: true,
			});
		}
	}

	await interaction.deferReply({ ephemeral: true });

	const client = container.resolve<Client>(Client);
	const sql = container.resolve<Sql<any>>(kSQL);

	if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageWebhooks)) {
		logger.error('error when doing ManageWebhooks check');
		throw new CommandError(i18n.t('common.errors.no_permissions', { lng }));
	}

	const channel = await client.channels.fetch(args.channel.id);
	if (channel?.type !== ChannelType.GuildText) {
		throw new CommandError(i18n.t('commands.config.wotd.errors.guild_text_only', { lng }));
	}

	const avatarUrl = cdn.avatar(client.user!.id, client.user!.avatar!, {
		extension: 'png',
	});

	const webhook = await channel
		.createWebhook({
			name: 'Thoth: Word of the Day',
			avatar: avatarUrl,
		})
		.catch((error) => {
			logger.error(error);
			return null;
		});

	if (!webhook) {
		return void interaction.editReply(
			i18n.t('commands.config.wotd.errors.no_perms', {
				lng,
				channel: channelMention(channel.id),
			}),
		);
	}

	// upsert the webhook into the database
	await sql<[WOTDConfig]>`
		INSERT INTO public.wotd (guild_id, created_by, webhook_id, webhook_token)
		VALUES (${channel.guildId!}, ${interaction.member!.user.id}, ${webhook.id}, ${webhook.token})
		ON CONFLICT (guild_id)
		DO UPDATE SET webhook_id = ${webhook.id}, webhook_token = ${webhook.token}
	`;

	// handle premium scheduling options
	if (timeArg && !timezoneArg) {
		return void interaction.editReply('You must provide a timezone when setting a custom time.');
	}

	if (!timeArg && timezoneArg) {
		return void interaction.editReply('You must provide a time when setting a timezone.');
	}

	if (timeArg && timezoneArg) {
		const parsedTime = parseTime(timeArg);
		if (!parsedTime) {
			return void interaction.editReply(
				'Invalid time format. Try something like "9:00 AM", "3:30 PM", or "15:00".',
			);
		}

		if (!validTimezones.has(timezoneArg)) {
			return void interaction.editReply(
				'Invalid timezone. Use the autocomplete suggestions (e.g. America/New_York, Europe/London).',
			);
		}

		await sql`
			UPDATE wotd SET post_time = ${parsedTime}::time, timezone = ${timezoneArg}
			WHERE guild_id = ${channel.guildId!}
		`;

		return void interaction.editReply(stripIndents`
			Word of the Day configured in ${channelMention(channel.id)}.
			Scheduled delivery: **${timeArg}** (${timezoneArg})
		`);
	}

	await interaction.editReply(
		i18n.t('commands.config.wotd.success', {
			lng,
			channel: channelMention(channel.id),
		}),
	);
};
