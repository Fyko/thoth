import { mergeDefault } from '@sapphire/utilities';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import type { CommandInteraction } from 'discord.js';
import i18n from 'i18next';
import fetch from 'node-fetch';
import type { Command } from '#structures';
import { firstUpperCase, trimArray } from '#util/index.js';
import type { ArgumentsOf } from '#util/types/index.js';

type SynonymHit = {
	score: number;
	word: string;
}

const data = {
	name: 'similar-spelling',
	description: 'Response with words that have a similar spelling to query.',
	options: [
		{
			name: 'word',
			description: 'The word to search similarly spelled words for.',
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

export default class implements Command {
	public readonly data = data;

	public exec = async (interaction: CommandInteraction, _args: Arguments, locale: string) => {
		const args = mergeDefault(_args, { ...argumentDefaults});

		const sendNotFound = async () =>
			interaction.reply({ content: i18n.t('common.errors.not_found', { lng: locale }), ephemeral: true });
		const response = await fetch(`https://api.datamuse.com/words?sp=${args.word}`);
		if (!response.ok) return sendNotFound();

		const body = (await response.json()) as SynonymHit[];
		const words = body.map((h) => h.word);

		if (!words.length) return sendNotFound();

		return interaction.reply(
			i18n.t('commands.similar-spelling.success', {
				found_count: words.length.toString(),
				word: firstUpperCase(args.word),
				words: trimArray(words, args.limit).join(', '),
				lng: locale,
			}).slice(0, 2_000),
		);
	};
}
