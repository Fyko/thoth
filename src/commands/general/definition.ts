/* eslint-disable @typescript-eslint/indent */
import type { Command } from '#structures';
import { Characters, Emojis } from '#util/constants';
import type { ArgumentsOf } from '#util/types';
import { hyperlink, inlineCode, underscore, hideLinkEmbed } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import type { CommandInteraction } from 'discord.js';
import type { Sense } from 'mw-collegiate';
import { list } from '#util/index';
import { createPronunciationURL, fetchDefinition } from '#mw';
import { formatText } from '#mw/format';

const data = {
	name: 'definition',
	description: 'Response with definition of your query from Merriam Webster.',
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

	public exec = async (interaction: CommandInteraction, { word }: ArgumentsOf<typeof data>): Promise<void> => {
		const { meta, hwi, def } = await fetchDefinition(word);

		const attachment = createPronunciationURL(hwi.prs?.[0].sound?.audio);

		const url = `https://www.merriam-webster.com/dictionary/${word}`;
		const pronunciation = hwi.prs?.[0].mw ? `(${hwi.prs[0].mw})` : '';
		const defs = def?.[0].sseq
			.flat(1)
			// @ts-ignore
			.filter(([type]) => type === 'sense')
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.map(([_, data]: Sense) => data.dt)
			.flat(1)
			.filter(([type]) => type === 'text')
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.map(([_, def]) => def);
		const parsedDefs = defs?.map(formatText);
		return interaction.reply({
			files: [
				{
					name: `${meta.id}.mp3`,
					attachment,
				},
			],
			content: stripIndents`
				${Emojis.MerriamWebster} ${hyperlink(inlineCode(meta.id), hideLinkEmbed(url))} ${
				Characters.Bullet
			} (${hwi.hw.replaceAll('*', Characters.Bullet)}) ${Characters.Bullet} ${pronunciation}
				${Characters.Bullet} Stems: ${list(meta.stems.map(inlineCode))}

				${underscore('Definitions')}
				${parsedDefs?.join('\n')}
			`,
		});
	};
}
