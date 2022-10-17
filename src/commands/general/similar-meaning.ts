import { URL } from 'node:url';
import { mergeDefault } from '@sapphire/utilities';
import type { APIApplicationCommandInteractionData, APIInteraction } from 'discord-api-types/v10';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import fetch from 'node-fetch';
import type { Command } from '#structures';
import { firstUpperCase, trimArray } from '#util/index.js';
import { createResponse } from '#util/respond.js';
import type { ArgumentsOf } from '#util/types/index.js';

type SynonymHit = {
	score: number;
	word: string;
};

const data = {
	name: 'similar-meaning',
	description: 'Response with words that have a similar meaning to your query.',
	options: [
		{
			name: 'word',
			description: 'The word to search similar words for.',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'starts-with',
			description: 'Only return words that start with this value (mutually exclusive with ends-with).',
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'ends-with',
			description: 'Only return words that end with this value (mutually exclusive with starts-with).',
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'limit',
			description: 'The maximum amount of results to return (max & default: 50).',
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

	public exec = async (res: FastifyReply, interaction: APIInteraction, locale: string) => {
		const { data } = interaction as { data: APIApplicationCommandInteractionData };
		const args = mergeDefault(
			argumentDefaults,
			Object.fromEntries(
				// @ts-expect-error pain
				data.options.map(({ name, value }: { name: string; value: any }) => [name, value]),
			) as Arguments,
		);

		if (args['starts-with'] && args['ends-with'])
			return createResponse(res, i18n.t('common.errors.with_clause_exclusivity'), true);

		const url = new URL('https://api.datamuse.com/words');
		url.searchParams.append('ml', args.word);

		const other: string[] = [];
		if (args['starts-with']) {
			url.searchParams.append('sp', `${args['starts-with']}*`);
			other.push(i18n.t('common.commands.starts_with_blurb', { lng: locale, word: args['starts-with'] }));
		} else if (args['ends-with']) {
			url.searchParams.append('sp', `*${args['ends-with']}`);
			other.push(i18n.t('common.commands.starts_with_blurb', { lng: locale, word: args['ends-with'] }));
		}

		const sendNotFound = async () => createResponse(res, i18n.t('common.errors.not_found', { lng: locale }), true);
		const response = await fetch(url.toString());
		if (!response.ok) return sendNotFound();

		const body = (await response.json()) as SynonymHit[];
		const words = body.map((h) => h.word);

		if (!words.length) return sendNotFound();

		return createResponse(
			res,
			i18n
				.t('commands.similar-meaning.success', {
					found_count: words.length.toString(),
					word: firstUpperCase(args.word),
					words: trimArray(words, args.limit).join(', '),
					rest: other.join(' '),
					lng: locale,
				})
				.slice(0, 2_000),
		);
	};
}
