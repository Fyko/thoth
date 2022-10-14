/* eslint-disable @typescript-eslint/indent */
import { hideLinkEmbed, hyperlink, inlineCode, underscore } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import type { CommandInteraction } from 'discord.js';
import type { Sense } from 'mw-collegiate';
import { createPronunciationURL, fetchDefinition } from '#mw';
import { formatText } from '#mw/format';
import { fetchWordOfTheDay } from '#mw/wotd';
import type { Command } from '#structures';
import { Characters, Emojis } from '#util/constants';
import { list } from '#util/index';

const data = {
	name: 'word-of-the-day',
	description: 'Response with the word of the day.',
} as const;

export default class implements Command {
	public readonly data = data;

	public exec = async (interaction: CommandInteraction) => {
		await interaction.deferReply();
		const word = await fetchWordOfTheDay();
		const { meta, hwi, def } = await fetchDefinition(word);

		const attachment = createPronunciationURL(hwi.prs?.[0].sound?.audio);

		const url = `https://www.merriam-webster.com/dictionary/${word}`;
		const pronunciation = hwi.prs?.[0].mw ? `(${hwi.prs[0].mw})` : '';
		const defs = def?.[0].sseq
			.flat(1)
			// @ts-expect-error
			.filter(([type]) => type === 'sense')
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.flatMap(([_, data]: Sense) => data.dt)
			.filter(([type]) => type === 'text')
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.map(([_, def]) => def);
		const parsedDefs = defs?.map(formatText);
		return interaction.editReply({
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
