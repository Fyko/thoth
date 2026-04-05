import { extname } from 'node:path';
import { Backend } from '@skyra/i18next-backend';
import { scan } from 'fs-nextra';
import i18next from 'i18next';
import { fetch } from 'undici';

export * from './symbols.js';
export * from './types/index.js';

/**
 * Picks a random element from an array
 *
 * @param arr - The array to pick a random element from
 * @returns A random element from the array
 */
export function pickRandom<Inner>(arr: Inner[]): Inner {
	return arr[Math.floor(Math.random() * arr.length)]!;
}

export async function datamuse(url: string) {
	return fetch(url, {
		headers: {
			'user-agent': 'Thoth (github.com/Fyko/Thoth)',
		},
	});
}

export function pluralize(number: number, suffix = 's'): string {
	if (number === 1) return '';
	return suffix;
}

export function trimArray(array: string[], maxLen = 10): string[] {
	if (array.length > maxLen) {
		const len = array.length - maxLen;
		const newArray = array.slice(0, maxLen);
		newArray.push(`${len} more...`);

		return newArray;
	}

	return array;
}

export function list(arr: string[], conj = 'and'): string {
	const len = arr.length;
	if (len === 0) return '';
	if (len === 1) return arr[0]!;

	return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
}

export async function walk(path: string) {
	return (
		await scan(path, {
			filter: (stats, path) =>
				stats.isFile() && ['.js', '.js'].includes(extname(stats.name)) && !path.includes('sub'),
		})
	).keys();
}

export async function loadTranslations(path: string) {
	i18next.use(Backend);
	const langs = ['en-US', 'en-GB', 'de', 'es-ES', 'ja', 'ko', 'pl', 'zh-CN', 'zh-TW'];

	return i18next.init({
		backend: {
			paths: [(lng, ns) => `${path}/${lng}/${ns}.json`],
		},
		preload: langs,
		supportedLngs: langs,
		cleanCode: true,
		fallbackLng: ['en-US'],
		defaultNS: 'translation',
		ns: ['translation'],
	});
}

export function firstUpperCase(text: string, split = ' '): string {
	return text
		.split(split)
		.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join(' ');
}
