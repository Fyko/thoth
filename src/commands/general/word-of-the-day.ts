/* eslint-disable @typescript-eslint/indent */
import type { Command } from '#structures';
import { Emojis, superscriptNumbers } from '#util/constants';
import { bold, hyperlink, inlineCode, italic, underscore } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import type { CommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { URL } from 'url';

export interface IWordOfTheDayResponse {
	_id: string;
	word: string;
	contentProvider: IContentProvider;
	definitions: IDefinition[];
	publishDate: Date;
	examples: IExample[];
	pdd: Date;
	note: string;
	htmlExtra: null;
}

export interface IContentProvider {
	name: string;
	id: number;
}

export interface IDefinition {
	source: string;
	text: string;
	note: null;
	partOfSpeech: string;
}

export interface IExample {
	url: string;
	title: string;
	text: string;
	id: number;
}

const data = {
	name: 'word-of-the-day',
	description: 'Response with the word of the day.',
} as const;

export default class implements Command {
	public readonly data = data;

	public exec = async (interaction: CommandInteraction): Promise<void> => {
		const url = new URL('http://api.wordnik.com/v4/words.json/wordOfTheDay');
		url.searchParams.append('api_key', process.env.WORDNIK_KEY!);

		const response = await fetch(url);
		if (!response.ok)
			return interaction.reply({
				content: "I'm sorry, I couldn't find any results for your query!",
				ephemeral: true,
			});
		const { word, definitions, examples } = (await response.json()) as IWordOfTheDayResponse;

		return interaction.reply(stripIndents`
			${Emojis.Wordnik} ${bold('Word of the day:')} ${inlineCode(word)} (${italic(definitions[0]?.partOfSpeech)})
			${definitions[0]?.text}

			${bold(underscore('Examples'))}
			${examples
				.slice(0, 3)
				.map(
					(e, i) => `${hyperlink(Reflect.get(superscriptNumbers, i + 1), e.url)} ${e.text.replace(word, bold(word))}`,
				)
				.join('\n')}
		`);
	};
}
