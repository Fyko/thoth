import Parser from 'rss-parser';
import type { RedisManager } from '#structures';

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
