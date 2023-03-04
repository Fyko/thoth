import { extname } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import type { Collection } from '@discordjs/collection';
import { Backend } from '@skyra/i18next-backend';
import type { APIPartialEmoji } from 'discord-api-types/v10';
import { scan } from 'fs-nextra';
import i18next from 'i18next';
import { container } from 'tsyringe';
import { fetch } from 'undici';
import { logger } from '#logger';
import type { Command } from '#structures';

export * from './symbols.js';
export * from './types/index.js';

export async function datamuse(url: string) {
	return fetch(url, {
		headers: {
			'user-agent': 'Thoth (github.com/Fyko/Thoth)',
		},
	});
}

export function transformEmojiString(emoji: string): APIPartialEmoji | null {
	const regex = /<?(?<animated>a)?:?(?<name>\w{2,32}):(?<id>\d{17,19})>?/;
	const exec = regex.exec(emoji);
	if (!exec) return null;

	const {
		groups: { name, id, animated },
	} = exec as RegExpExecArray & { groups: Record<'id' | 'name', string> & { animated?: string } };

	return {
		name,
		id,
		animated: Boolean(animated),
	};
}

export function createMessageLink(...[guildId, channelId, messageId]: string[]): string {
	return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
}

export function pluralize(number: number, suffix = 's'): string {
	if (number === 1) return '';
	return suffix;
}

export function localize(number: number, locale = 'en-US'): string {
	try {
		return new Intl.NumberFormat(locale).format(number);
	} catch {}

	return new Intl.NumberFormat('en-US').format(number);
}

export function trimArray<T = string>(array: T[], maxLen = 10): any[] {
	if (array.length > maxLen) {
		const len = array.length - maxLen;
		const newArray = array.slice(0, maxLen);
		newArray.push(`${len} more...` as T);

		return newArray;
	}

	return array;
}

export function list(arr: string[], conj = 'and'): string {
	const len = arr.length;
	if (len === 0) return '';
	if (len === 1) return arr[0];

	return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
}

export async function walk(path: string) {
	return (
		await scan(path, {
			filter: (stats, path) => stats.isFile() && ['.js', '.ts'].includes(extname(stats.name)) && !path.includes('sub'),
		})
	).keys();
}

export function fetchDataLocalizations(key: string): Record<string, string> {
	// @ts-expect-error
	return (i18next.options.preload as string[]).reduce((acc, lng) => {
		Reflect.set(acc, lng, i18next.t(key, { lng }));
		return acc;
	}, {});
}

export async function loadCommands(commandStore: Collection<string, Command>, ci = false) {
	const files = await walk(fileURLToPath(new URL('../commands', import.meta.url)));

	for (const file of files) {
		const command = container.resolve<Command>((await import(file)).default);
		const data = command.data;
		commandStore.set(data.name, command);
		if (!ci) logger.info(`Successfully loaded command "${data.name}"!`);
	}

	return commandStore;
}

export async function loadTranslations() {
	i18next.use(Backend);
	const langs = ['en-US', 'de', 'pt-BR', 'da'];

	return i18next.init({
		backend: {
			paths: [(lng, ns) => `./locales/${lng}/${ns}.json`],
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
