import { URL } from 'node:url';
import { mergeDefault } from '@sapphire/utilities';
import type { APIApplicationCommandInteractionData, APIInteraction } from 'discord-api-types/v10';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import type { Command } from '#structures';
import { datamuse, fetchDataLocalizations, firstUpperCase, trimArray } from '#util/index.js';
import { createResponse } from '#util/respond.js';
import type { ArgumentsOf } from '#util/types/index.js';

type SynonymHit = {
	score: number;
	word: string;
};

const data = {
	name: i18n.t('commands.similar-meaning.meta.name'),
	name_localizations: fetchDataLocalizations('commands.similar-meaning.meta.name'),
	description: i18n.t('commands.similar-meaning.meta.description'),
	description_localizations: fetchDataLocalizations('commands.similar-meaning.meta.description'),
	options: [
		{
			name: 'word',
			name_localizations: fetchDataLocalizations('commands.similar-meaning.meta.args.word.name'),
			description: i18n.t('commands.similar-meaning.meta.args.word.description'),
			description_localizations: fetchDataLocalizations('commands.similar-meaning.meta.args.word.description'),
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'starts-with',
			name_localizations: fetchDataLocalizations('common.commands.args.starts-with.name'),
			description: i18n.t('common.commands.args.starts-with.description'),
			description_localizations: fetchDataLocalizations('common.commands.args.starts-with.description'),
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'ends-with',
			name_localizations: fetchDataLocalizations('common.commands.args.ends-with.name'),
			description: i18n.t('common.commands.args.ends-with.description'),
			description_localizations: fetchDataLocalizations('common.commands.args.ends-with.description'),
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'limit',
			name_localizations: fetchDataLocalizations('common.commands.args.limit.name'),
			description: i18n.t('common.commands.args.limit.description'),
			description_localizations: fetchDataLocalizations('common.commands.args.limit.description'),
			type: ApplicationCommandOptionType.Integer,
		},
	],
} as const;

type Arguments = ArgumentsOf<typeof data>;

const argumentDefaults: Partial<Arguments> = {
	limit: 50,
};

export default class implements Command {
	public readonly data = data;

	public exec = async (res: FastifyReply, interaction: APIInteraction, lng: string) => {
		const { data } = interaction as { data: APIApplicationCommandInteractionData };
		const args = mergeDefault(
			argumentDefaults,
			Object.fromEntries(
				// @ts-expect-error pain
				data.options.map(({ name, value }: { name: string; value: any }) => [name, value]),
			) as Arguments,
		);

		const startsWith = args['starts-with'];
		const endsWith = args['ends-with'];

		if (startsWith && endsWith)
			return createResponse(res, i18n.t('common.errors.with_clause_exclusivity', { lng }), true);

		const url = new URL('https://api.datamuse.com/words');
		url.searchParams.append('ml', args.word);

		if (startsWith) {
			url.searchParams.append('sp', `${startsWith}*`);
		} else if (endsWith) {
			url.searchParams.append('sp', `*${endsWith}`);
		}

		const sendNotFound = async () => createResponse(res, i18n.t('common.errors.not_found', { lng }), true);
		const response = await datamuse(url.toString());
		if (!response.ok) return sendNotFound();

		const body = (await response.json()) as SynonymHit[];
		const words = body.map((h) => h.word);

		if (!words.length) return sendNotFound();

		const content = startsWith
			? i18n.t('commands.similar-meaning.starts_with_success', {
					lng,
					found_count: words.length.toString(),
					word: firstUpperCase(args.word),
					words: trimArray(words, args.limit).join(', '),
					starts_with: startsWith,
			  })
			: endsWith
			? i18n.t('commands.similar-meaning.ends_with_success', {
					lng,
					found_count: words.length.toString(),
					word: firstUpperCase(args.word),
					words: trimArray(words, args.limit).join(', '),
					ends_with: endsWith,
			  })
			: i18n.t('commands.similar-meaning.generic_success', {
					lng,
					found_count: words.length.toString(),
					word: firstUpperCase(args.word),
					words: trimArray(words, args.limit).join(', '),
			  });

		return createResponse(res, content.slice(0, 2_000));
	};
}
