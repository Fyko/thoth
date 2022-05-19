import type { Command } from '#structures';
import { inlineCode } from '@discordjs/builders';
import { mergeDefault } from '@sapphire/utilities';
import { stripIndents } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import type { CommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { ArgumentsOf, firstUpperCase, trimArray } from '../../util';

interface SynonymHit {
	score: number;
	word: string;
}

const data = {
	name: 'noun',
	description: 'Response with nouns that are often described by your query.',
	options: [
		{
			name: 'word',
			description: 'The adjective to search relevant nouns for (eg: yellow).',
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

	public exec = async (interaction: CommandInteraction, _args: Arguments): Promise<void> => {
		const args = mergeDefault(_args, Object.assign({}, argumentDefaults));

		const sendNotFound = () =>
			interaction.reply({ content: "I'm sorry, I couldn't find any results for your query!", ephemeral: true });
		const response = await fetch(`https://api.datamuse.com/words?rel_jja=${args.word}`);
		if (!response.ok) return sendNotFound();

		const body = (await response.json()) as SynonymHit[];
		const words = body.map((h) => h.word);

		if (!words.length) return sendNotFound();

		return interaction.reply(
			stripIndents`
			I found ${inlineCode(words.length.toString())} nouns for ${inlineCode(firstUpperCase(args.word))}:

			${trimArray(words, args.limit).join(', ')}
		`.substring(0, 2000),
		);
	};
}
