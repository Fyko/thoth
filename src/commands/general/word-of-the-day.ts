import { hideLinkEmbed, hyperlink, inlineCode, underscore } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import type { CommandInteraction } from 'discord.js';
import type { Sense, Senses } from 'mw-collegiate';
import { createPronunciationURL, fetchDefinition } from '#mw';
import { formatText } from '#mw/format.js';
import { fetchWordOfTheDay } from '#mw/wotd.js';
import type { Command } from '#structures';
import { Characters, Emojis } from '#util/constants.js';
import { list } from '#util/index.js';

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
		const defs = (def![0].sseq)
			.flat(1)
			.filter(([type]: Senses) => type === 'sense')
			.map(([, data]: Sense) => data.dt);

		// damn you typescipt
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
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
