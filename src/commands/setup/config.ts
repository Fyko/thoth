import type { APIApplicationCommandSubcommandOption, APIChatInputApplicationCommandGuildInteraction } from 'discord-api-types/v10';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import { injectable } from 'tsyringe';
import { wotd } from './sub/wotd.js';
import type { Command } from '#structures';
import { fetchDataLocalizations } from '#util/index.js';
import { createResponse } from '#util/respond.js';

const data = {
	name: i18n.t('commands.setup.meta.name'),
	name_localizations: fetchDataLocalizations('commands.setup.meta.name'),
	description: i18n.t('commands.setup.meta.description'),
	description_localizations: fetchDataLocalizations('commands.setup.meta.description'),
	options: [
		{
			name: 'wotd',
			name_localizations: fetchDataLocalizations('commands.setup.wotd.meta.name'),
			description: i18n.t('commands.setup.wotd.meta.description'),
			description_localizations: fetchDataLocalizations('commands.setup.wotd.meta.description'),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'channel',
					name_localizations: fetchDataLocalizations('commands.setup.wotd.meta.args.channel.name'),
					description: i18n.t('commands.setup.wotd.meta.args.channel.description'),
					description_localizations: fetchDataLocalizations('commands.setup.wotd.meta.args.channel.description'),
					type: ApplicationCommandOptionType.Channel,
					required: true,
				},
			],
		},
	],
} as const;

@injectable()
export default class implements Command {
	public readonly data = data;

	public exec = async (res: FastifyReply, interaction: APIChatInputApplicationCommandGuildInteraction, lng: string) => {
		console.dir(interaction, { depth: null });
		const { data } = interaction;

		const sub = data.options![0] as APIApplicationCommandSubcommandOption;
		console.dir(sub)

		if (sub.name === 'wotd') {
			const args = Object.fromEntries(
				// @ts-expect-error i dont wanna fish through dapi-types to find the right one
				sub.options!.map(({ name, value }: { name: string; value: any }) => [name, value]),
			);

			return wotd(res, interaction, args as { channel: string }, lng);
		}

		return createResponse(res, i18n.t('common.errors.not_found', { lng }), true);		
	};
}
