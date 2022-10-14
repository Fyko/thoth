/* eslint-disable @typescript-eslint/indent */
import { URL } from 'node:url';
import { inlineCode } from '@discordjs/builders';
import { mergeDefault } from '@sapphire/utilities';
import { stripIndents } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import type { CommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import type { ArgumentsOf} from '../../util';
import { firstUpperCase, trimArray } from '../../util';
import type { Command } from '#structures';

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

	public exec = async (interaction: CommandInteraction, _args: Arguments) => {
		const args = mergeDefault(_args, { ...argumentDefaults});
		if (args['starts-with'] && args['ends-with'])
			return interaction.reply({
				content: `The ${inlineCode('starts-with')} and ${inlineCode(
					'ends-with',
				)} options are mutually exclusive -- you can't use them both at the same time.`,
				ephemeral: true,
			});

		const url = new URL('https://api.datamuse.com/words');
		url.searchParams.append('lc', args.word);

		const other: string[] = [];
		if (args['starts-with']) {
			url.searchParams.append('sp', `${args['starts-with']}*`);
			other.push(` that starts with ${inlineCode(args['starts-with'])}`);
		} else if (args['ends-with']) {
			url.searchParams.append('sp', `*${args['starts-with']}`);
			other.push(` that ends with ${inlineCode(args['ends-with'])}`);
		}

		const sendNotFound = async () =>
			interaction.reply({ content: "I'm sorry, I couldn't find any results for your query!", ephemeral: true });
		const response = await fetch(url);
		if (!response.ok) return sendNotFound();

		const body = (await response.json()) as SynonymHit[];
		const words = body.map((h) => h.word);

		if (!words.length) return sendNotFound();

		return interaction.reply(
			stripIndents`
			I found ${inlineCode(words.length.toString())} words that could logically follow ${inlineCode(
				firstUpperCase(args.word),
			)}${other.join(' ')}:

			${trimArray(words, args.limit).join(', ')}
		`.slice(0, 2_000),
		);
	};
}
