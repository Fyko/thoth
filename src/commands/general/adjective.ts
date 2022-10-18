import { mergeDefault } from '@sapphire/utilities';
import type { APIApplicationCommandInteractionData, APIInteraction } from 'discord-api-types/v10';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import { injectable } from 'tsyringe';
import type { Command } from '#structures';
import { datamuse, firstUpperCase, trimArray } from '#util/index.js';
import { createResponse } from '#util/respond.js';
import type { ArgumentsOf } from '#util/types/index.js';

type SynonymHit = {
	score: number;
	word: string;
};

const data = {
	name: 'adjective',
	description: 'Response with adjectives that describe your query.',
	options: [
		{
			name: 'word',
			description: 'The noun to search relavent adjectives for (eg: ocean).',
			type: ApplicationCommandOptionType.String,
			required: true,
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

@injectable()
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

		const sendNotFound = async () => createResponse(res, i18n.t('common.errors.not_found', { lng: locale }), true);
		const response = await datamuse(`https://api.datamuse.com/words?rel_jjb=${args.word}`);
		if (!response.ok) return sendNotFound();

		const body = (await response.json()) as SynonymHit[];
		const words = body.map((h) => h.word);

		if (!words.length) return sendNotFound();

		return createResponse(
			res,
			i18n.t('commands.adjective.success', {
				found_count: words.length.toString(),
				word: firstUpperCase(args.word),
				words: trimArray(words, args.limit).join(', '),
				lng: locale,
			}),
		);
	};
}
