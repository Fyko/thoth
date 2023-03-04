import { URL } from 'node:url';
import { mergeDefault } from '@sapphire/utilities';
import type { APIApplicationCommandInteractionData, APIInteraction } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import ThatFollowCommand from '#interactions/commands/general/that-follow.js';
import type { Command } from '#structures';
import { datamuse, firstUpperCase, trimArray } from '#util/index.js';
import { createResponse } from '#util/respond.js';
import type { ArgumentsOf } from '#util/types/index.js';

type SynonymHit = {
	score: number;
	word: string;
};

type Arguments = ArgumentsOf<typeof ThatFollowCommand>;

const argumentDefaults: Partial<Arguments> = {
	limit: 50,
};

export default class implements Command {
	public readonly data = ThatFollowCommand;

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
		url.searchParams.append('lc', args.word);

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
			? i18n.t('commands.that-follow.starts_with_success', {
					lng,
					found_count: words.length.toString(),
					word: firstUpperCase(args.word),
					words: trimArray(words, args.limit).join(', '),
					starts_with: startsWith,
			  })
			: endsWith
			? i18n.t('commands.that-follow.ends_with_success', {
					lng,
					found_count: words.length.toString(),
					word: firstUpperCase(args.word),
					words: trimArray(words, args.limit).join(', '),
					ends_with: endsWith,
			  })
			: i18n.t('commands.that-follow.generic_success', {
					lng,
					found_count: words.length.toString(),
					word: firstUpperCase(args.word),
					words: trimArray(words, args.limit).join(', '),
			  });

		return createResponse(res, content.slice(0, 2_000));
	};
}
