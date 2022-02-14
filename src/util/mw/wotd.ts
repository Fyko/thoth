import Parser from 'rss-parser';
const parser = new Parser();

const formatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/New_York',
	month: '2-digit',
	day: '2-digit',
	year: 'numeric',
});

export async function fetchWordOfTheDay(): Promise<string> {
	const parts = formatter.formatToParts(new Date());

	const year = parts.find((p) => p.type === 'year');
	const month = parts.find((p) => p.type === 'month');
	const day = parts.find((p) => p.type === 'day');
	const partialISO = `${year!.value}-${month!.value}-${day!.value}` as const;

	const parsed = await parser.parseURL('https://www.merriam-webster.com/wotd/feed/rss2');
	const today = parsed.items.find((i) => i.isoDate?.startsWith(partialISO));

	return today!.title!;
}
