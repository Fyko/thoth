/* eslint-disable @typescript-eslint/indent */
import { createPronunciationURL, fetchDefinition } from '#mw';
import { formatText } from '#mw/format';
import type { Command } from '#structures';
import { Characters, Emojis } from '#util/constants';
import { list } from '#util/index';
import type { ArgumentsOf } from '#util/types';
import { hideLinkEmbed, hyperlink, inlineCode, underscore, quote } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import type { CommandInteraction } from 'discord.js';

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
		console.dir(
			def![0].sseq
				.flat(1)
				// @ts-ignore
				.filter(([type]) => type === 'sense')
				.map(([, data]) => data),
			{ depth: null },
		);

		const attachment = createPronunciationURL(hwi.prs?.[0].sound?.audio);

		const url = `https://www.merriam-webster.com/dictionary/${word}`;
		const pronunciation = hwi.prs?.[0].mw ? `(${hwi.prs[0].mw})` : '';

		const senses = def![0].sseq
			.flat(1)
			// @ts-ignore
			.filter(([type]) => type === 'sense')
			.map(([, data]) => data);
		console.dir(senses, { depth: null });
		const ds = senses
			.map(({ dt }, _, arr) => {
				console.dir(arr);
				console.dir(dt);
				const def = dt.find(([type]) => type === 'text');
				if (!def) return;

				const [, text] = def;
				const vis = dt.find(([type]) => type === 'vis');
				if (vis) {
					const [, [{ t, aq }]] = vis;
					if (aq) {
						return `${text}\n${quote(`${t} -${aq.auth}`)}\n`;
					}
					return `${text}\n${quote(t)}\n`;
				}

				return text;
			})
			.filter(Boolean)
			.map(formatText);
		console.dir(ds);

		// const definingText = def![0].sseq
		// 	.flat(1)
		// 	// @ts-ignore
		// 	.filter(([type]) => type === 'sense')
		// 	.map(([, data]: Sense) => data.dt)
		// 	.flat(1);
		// console.dir(definingText, { depth: null });

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		// const defs = definingText
		// 	.filter(([type]) => type === 'text')
		// 	// eslint-disable-next-line @typescript-eslint/no-unused-vars
		// 	.map(([_, def]) => def);
		// const parsedDefs = defs.map(formatText);

		// const examples = definingText.filter(([type]) => type === 'vis') as VerbalIllustrations[];
		// const parsedExamples = (examples.flat(Infinity) as ('vis' | VerbalIllustrationObject)[])
		// 	.filter((m) => typeof m === 'object')
		// 	.map(({ t, aq }: VerbalIllustrationObject) => {
		// 		if (aq) {
		// 			return `"${t}" -${aq.auth}`;
		// 		}
		// 		return `"${t}"`;
		// 	})
		// 	.map(formatText);
		// console.log('examples:');
		// console.dir(parsedExamples, { depth: null });

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
				${ds.join('\n')}
			`,
		});
	};
}
