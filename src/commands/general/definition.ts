import type { Command } from '#structures';
import { Emojis } from '#util/constants';
import type { ArgumentsOf } from '#util/types';
import { hyperlink, inlineCode, italic } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import type { CommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { URL } from 'url';

interface IWordDefinition {
	id: string;
	partOfSpeech: string;
	attributionText: string;
	sourceDictionary: string;
	text: string;
	sequence: string;
	score: number;
	labels: unknown[];
	citations: unknown[];
	word: string;
	relatedWords: any[];
	exampleUses: { text: string }[];
	textProns: unknown[];
	notes: unknown[];
	attributionUrl: string;
	wordnikUrl: string;
}

const data = {
	name: 'definition',
	description: 'Response with definition of your query.',
	options: [
		{
			name: 'word',
			description: 'The word to search the defition of.',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
} as const;

export default class implements Command {
	public readonly data = data;

	public exec = async (interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> => {
		const encodedWord = encodeURIComponent(args.word);
		const url = new URL(`http://api.wordnik.com/v4/word.json/${encodedWord}/definitions`);
		url.searchParams.append('limit', '1');
		url.searchParams.append('includeRelated', 'false');
		url.searchParams.append('useCanonical', 'true');
		url.searchParams.append('api_key', process.env.WORDNIK_KEY!);

		const response = await fetch(url);
		if (!response.ok)
			return interaction.reply({
				content: "I'm sorry, I couldn't find any results for your query!",
				ephemeral: true,
			});
		const [word] = (await response.json()) as IWordDefinition[];

		return interaction.reply(stripIndents`
			${Emojis.Wordnik} ${hyperlink(inlineCode(word.word), word.wordnikUrl)} (${italic(word.partOfSpeech)})
			${word.text}
		`);
	};
}
