/* eslint-disable @typescript-eslint/indent */
import { hideLinkEmbed, hyperlink, inlineCode, quote, underscore } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import type { CommandInteraction } from 'discord.js';
import { createPronunciationURL, fetchDefinition } from '#mw';
import { formatText } from '#mw/format';
import type { Command } from '#structures';
import { Characters, Emojis } from '#util/constants';
import { trimArray } from '#util/index';
import type { ArgumentsOf } from '#util/types';

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

	public exec = async (interaction: CommandInteraction, { word }: ArgumentsOf<typeof data>) => {
		const res = await fetchDefinition(word);
		console.dir(res, { depth: null });
		const { hwi, def, meta, fl } = res;

		const attachment = createPronunciationURL(hwi.prs?.[0].sound?.audio);

		const url = `https://www.merriam-webster.com/dictionary/${word}`;
		const pronunciation = hwi.prs?.[0].mw ? `(${hwi.prs[0].mw})` : '';

		const senses = def![0].sseq
			.flat(1)
			// @ts-expect-error
			.filter(([type]) => type === 'sense')
			.map(([, data]) => data);

		const defs = senses
			.map(({ dt }) => {
				const def = dt.find(([type]) => type === 'text');
				if (!def) return;

				const [, text] = def;
				const vis = dt.find(([type]) => type === 'vis');
				if (vis) {
					const [, [{ t, aq }]] = vis;
					if (aq) {
						return `${text}\n${quote(`"${t}" -${aq.auth}`)}`;
					}

					return `${text}\n${quote(`"${t}"`)}`;
				}

				return text;
			})
			.filter(Boolean)
			.map(formatText);

		// FUTURE: add buttons for link to synonyms and antonyms
		// const row = new MessageActionRow().addComponents(
		// 	new MessageSelectMenu()
		// 		.setCustomId('foo')
		// 		.setPlaceholder('Additional Options')
		// 		.addOptions([
		// 			{
		// 				label: 'Synonyms',
		// 				description: 'Search for synonyms of this word.',
		// 				value: 'synonyms',
		// 				emoji: '🤔',
		// 			},
		// 		]),
		// );

		return interaction.reply({
			files: [
				{
					name: `${meta.id}.mp3`,
					attachment,
				},
			],
			content: stripIndents`
				${Emojis.MerriamWebster} ${hyperlink(inlineCode(meta.id), hideLinkEmbed(url))} (${fl}) ${
				Characters.Bullet
			} (${hwi.hw.replaceAll('*', Characters.Bullet)}) ${Characters.Bullet} ${pronunciation}
				${Characters.Bullet} Stems: ${trimArray(meta.stems.map(inlineCode), 15).join(', ')}

				${underscore('Definitions')}
				${defs.join('\n')}
			`,
		});
	};
}
