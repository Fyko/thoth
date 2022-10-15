import { URL } from 'node:url';
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
	name: 'that-follow',
	description: 'Response with words that could logically follow query.',
	options: [
		{
			name: 'word',
			description: 'The word to search following words for.',
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

	public exec = async (interaction: CommandInteraction, _args: Arguments, locale: string) => {
		const args = mergeDefault(_args, { ...argumentDefaults});
		if (args['starts-with'] && args['ends-with'])
			return interaction.reply({
				content: i18n.t('common.errors.with_clause_exclusivity'),
				ephemeral: true,
			});

		const url = new URL('https://api.datamuse.com/words');
		url.searchParams.append('lc', args.word);

		const other: string[] = [];
		if (args['starts-with']) {
			url.searchParams.append('sp', `${args['starts-with']}*`);
			other.push(i18n.t('common.commands.starts_with_blurb', { lng: locale, word: args['starts-with']}))
		} else if (args['ends-with']) {
			url.searchParams.append('sp', `*${args['ends-with']}`);
			other.push(i18n.t('common.commands.starts_with_blurb', { lng: locale, word: args['ends-with']}))
		}

		const sendNotFound = async () =>
			interaction.reply({ content: i18n.t('common.errors.not_found', { lng: locale }), ephemeral: true });
		const response = await fetch(url);
		if (!response.ok) return sendNotFound();

		const body = (await response.json()) as SynonymHit[];
		const words = body.map((h) => h.word);

		if (!words.length) return sendNotFound();

		return interaction.reply(
			i18n.t('commands.that-follow.success', {
				found_count: words.length.toString(),
				word: firstUpperCase(args.word),
				words: trimArray(words, args.limit).join(', '),
				rest: other.join(' '),
				lng: locale,
			}).slice(0, 2_000),
		);
	};
}
