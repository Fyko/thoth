import { mergeDefault } from '@sapphire/utilities';
import type { APIApplicationCommandInteractionData, APIInteraction } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import { injectable } from 'tsyringe';
import AdjectiveCommand from '#interactions/commands/general/adjective.js';
import type { Command } from '#structures';
import { datamuse, firstUpperCase, trimArray } from '#util/index.js';
import { createResponse } from '#util/respond.js';
import type { ArgumentsOf } from '#util/types/index.js';

type SynonymHit = {
	score: number;
	word: string;
};

type Arguments = ArgumentsOf<typeof AdjectiveCommand>;

const argumentDefaults: Partial<Arguments> = {
	limit: 50,
};

@injectable()
export default class implements Command {
	public readonly data = AdjectiveCommand;

	public exec = async (res: FastifyReply, interaction: APIInteraction, lng: string) => {
		const { data } = interaction as { data: APIApplicationCommandInteractionData };
		const args = mergeDefault(
			argumentDefaults,
			Object.fromEntries(
				// @ts-expect-error pain
				data.options.map(({ name, value }: { name: string; value: any }) => [name, value]),
			) as Arguments,
		);

		const sendNotFound = async () => createResponse(res, i18n.t('common.errors.not_found', { lng }), true);
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
				lng,
			}),
		);
	};
}
