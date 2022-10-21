import { hideLinkEmbed, hyperlink, inlineCode, quote, underscore } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import type { APIInteraction } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import type { Entry, Sense, Senses, VerbalIllustration } from 'mw-collegiate';
import { fetchDefinition } from '#mw';
import { formatText } from '#mw/format.js';
import { fetchWordOfTheDay } from '#mw/wotd.js';
import type { Command } from '#structures';
import { Characters, Emojis } from '#util/constants.js';
import { fetchDataLocalizations, trimArray } from '#util/index.js';
import { createResponse } from '#util/respond.js';

const data = {
	name: i18n.t('commands.word-of-the-day.meta.name'),
	name_localizations: fetchDataLocalizations('commands.word-of-the-day.meta.name'),
	description: i18n.t('commands.word-of-the-day.meta.description'),
	description_localizations: fetchDataLocalizations('commands.word-of-the-day.meta.description'),
} as const;

export default class implements Command {
	public readonly data = data;

	public exec = async (res: FastifyReply, _: APIInteraction, lng: string) => {
		const word = await fetchWordOfTheDay();

		const [defRes] = await fetchDefinition(word);
		if (defRes instanceof String) {
			return createResponse(res, i18n.t('common.errors.not_found', { lng }), true);
		}

		const { hwi, def, meta, fl } = defRes as Entry;

		// const attachment = createPronunciationURL(hwi.prs?.[0].sound?.audio);

		const url = `https://www.merriam-webster.com/dictionary/${word}`;
		const pronunciation = hwi.prs?.[0].mw ? `(${hwi.prs[0].mw})` : '';
		const senses = def![0].sseq
			.flat(1)
			.filter(([type]: Senses) => type === 'sense')
			.map(([, data]: Sense) => data);

		const defs = senses
			.map(({ dt }) => {
				const def = dt.find(([type]) => type === 'text');
				if (!def) return false;

				const [, text] = def;
				const vis = dt.find(([type]) => type === 'vis') as ['vis', VerbalIllustration];

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

		return createResponse(
			res,
			stripIndents`
				${Emojis.MerriamWebster} ${hyperlink(inlineCode(meta.id), hideLinkEmbed(url))} (${fl}) ${
				Characters.Bullet
			} (${hwi.hw.replaceAll('*', Characters.Bullet)}) ${Characters.Bullet} ${pronunciation}
				${Characters.Bullet} Stems: ${trimArray(meta.stems.map(inlineCode), 15).join(', ')}

				${underscore(i18n.t('common.titles.definitions', { lng }))}
				${defs.join('\n')}
			`,
			false,
		);
	};
}
