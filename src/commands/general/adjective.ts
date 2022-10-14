import { inlineCode } from '@discordjs/builders';
import { mergeDefault } from '@sapphire/utilities';
import { stripIndents } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import type { CommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { inject, injectable } from 'tsyringe';
import type { ArgumentsOf} from '../../util';
import { firstUpperCase, kMetrics, trimArray } from '../../util';
import type { Command } from '#structures';
import { MetricsHandler } from '#structures';

type SynonymHit = {
	score: number;
	word: string;
}

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
	public constructor(
		@inject(kMetrics) protected readonly metrics: MetricsHandler,
	) {}

	public readonly data = data;

	public exec = async (interaction: CommandInteraction, _args: Arguments) => {
		const args = mergeDefault(_args, { ...argumentDefaults});

		const sendNotFound = async () =>
			interaction.reply({ content: "I'm sorry, I couldn't find any results for your query!", ephemeral: true });
		const response = await fetch(`https://api.datamuse.com/words?rel_jjb=${args.word}`);
		if (!response.ok) return sendNotFound();

		const body = (await response.json()) as SynonymHit[];
		const words = body.map((h) => h.word);

		if (!words.length) return sendNotFound();

		return interaction.reply(
			stripIndents`
			I found ${inlineCode(words.length.toString())} adjectives to describe ${inlineCode(firstUpperCase(args.word))}:

			${trimArray(words, args.limit).join(', ')}
		`.slice(0, 2_000),
		);
	};
}
