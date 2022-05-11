/* eslint-disable @typescript-eslint/indent */
import type { Command } from '#structures';
import { inlineCode } from '@discordjs/builders';
import { mergeDefault } from '@sapphire/utilities';
import { stripIndents } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import type { CommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { URL } from 'url';
import { ArgumentsOf, firstUpperCase, trimArray } from '../../util';

interface SynonymHit {
	score: number;
	word: string;
}

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

	public exec = async (interaction: CommandInteraction, _args: Arguments): Promise<void> => {
		const args = mergeDefault(_args, Object.assign({}, argumentDefaults));
		if (args['starts-with'] && args['ends-with'])
			return interaction.reply({
				content: `The ${inlineCode('starts-with')} and ${inlineCode(
					'ends-with',
				)} options are mutually exclusive -- you can't use them both at the same time.`,
				ephemeral: true,
			});

		const url = new URL('https://api.datamuse.com/words');
		url.searchParams.append('ml', args.word);

		const other: string[] = [];
		if (args['starts-with']) {
			url.searchParams.append('sp', `${args['starts-with']}*`);
			other.push(` that starts with ${inlineCode(args['starts-with'])}`);
		} else if (args['ends-with']) {
			url.searchParams.append('sp', `*${args['starts-with']}`);
			other.push(` that ends with ${inlineCode(args['ends-with'])}`);
		}

		const sendNotFound = () =>
			interaction.reply({ content: "I'm sorry, I couldn't find any results for your query!", ephemeral: true });
		const response = await fetch(url);
		if (!response.ok) return sendNotFound();

		const body = (await response.json()) as SynonymHit[];
		const words = body.map((h) => h.word);

		if (!words.length) return sendNotFound();

		return interaction.reply(
			stripIndents`
			I found ${inlineCode(words.length.toString())} words that sound similar to ${inlineCode(
				firstUpperCase(args.word),
			)}${other.join(' ')}:

			${trimArray(words, args.limit).join(', ')}
		`.substring(0, 2000),
		);
	};
}
