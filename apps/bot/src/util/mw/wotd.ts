import { hideLinkEmbed, hyperlink, inlineCode, quote, underscore } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import i18n from 'i18next';
import type { Entry, Sense, Senses, VerbalIllustration } from 'mw-collegiate';
import Parser from 'rss-parser';
import type { RedisManager } from '#structures';
import { Emojis } from '#util/constants.js';
import { trimArray } from '#util/index.js';
import { Characters } from './constants.js';
import { formatText } from './format.js';

const parser = new Parser();

const formatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/New_York',
	month: '2-digit',
	day: '2-digit',
	year: 'numeric',
});

export async function fetchWordOfTheDay(redis: RedisManager): Promise<string> {
	const parts = formatter.formatToParts(new Date());

	const year = parts.find(({ type }) => type === 'year');
	const month = parts.find(({ type }) => type === 'month');
	const day = parts.find(({ type }) => type === 'day');
	const partialISO = `${year!.value}-${month!.value}-${day!.value}` as const;

	const key = `wotd:${partialISO}`;
	const cached = await redis.client.get(key);
	if (cached) return cached;

	const parsed = await parser.parseURL('https://www.merriam-webster.com/wotd/feed/rss2');
	const today = parsed.items.find((item) => item.isoDate?.startsWith(partialISO));

	await redis.client.set(key, today!.title!, 'EX', 60 * 60 * 4);

	return today!.title!;
}

/**
 * Creates the content for the Word of the Day message.
 *
 * @param entry - The MW entry
 * @param lng - The i18n locale
 * @returns The formatted content
 */
export const createWOTDContent = (entry: Entry, lng: string) => {
	const { hwi, def, meta, fl } = entry;

	// const attachment = createPronunciationURL(hwi.prs?.[0].sound?.audio);
	const url = `https://www.merriam-webster.com/dictionary/${meta.id}`;
	const pronunciation = hwi.prs?.[0]?.mw ? `(${hwi.prs[0].mw})` : '';
	const senses = def![0]!.sseq
		.flat(1)
		// @ts-expect-error pain
		.filter(([type]: Senses) => type === 'sense')
		// @ts-expect-error pain
		.map(([, data]: Sense) => data);

	const defs = senses
		.map(({ dt }) => {
			const def = dt.find(([type]) => type === 'text');
			if (!def) return false;

			const [, text] = def;
			const vis = dt.find(([type]) => type === 'vis') as ['vis', VerbalIllustration];

			if (vis) {
				const [, [vi]] = vis;
				if (vi?.aq) {
					return `${text as string}\n${quote(`"${vi.t}" -${vi.aq.auth}`)}`;
				}

				return `${text as string}\n${quote(`"${vi!.t}"`)}`;
			}

			return text as string;
		})
		.filter((text) => typeof text === 'string')
		.map((text) => formatText(text as string));

	return stripIndents`
		${Emojis.MerriamWebster} ${hyperlink(inlineCode(meta.id), hideLinkEmbed(url))} (${fl}) ${
			Characters.Bullet
		} (${hwi.hw.replaceAll('*', Characters.Bullet)}) ${Characters.Bullet} ${pronunciation}
		${Characters.Bullet} Stems: ${trimArray(meta.stems.map(inlineCode), 15).join(', ')}

		${underscore(i18n.t('common.titles.definitions', { lng }))}
		${defs.join('\n')}
	`;
};
