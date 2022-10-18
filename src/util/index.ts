import { extname } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import type { Collection } from '@discordjs/collection';
import type { APIPartialEmoji } from 'discord-api-types/v10';
import { scan } from 'fs-nextra';
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

async function walk(path: string) {
	return (
		await scan(path, {
			filter: (stats) => stats.isFile() && ['.js', '.ts'].includes(extname(stats.name)),
		})
	).keys();
}

export async function loadCommands(commandStore: Collection<string, Command>) {
	const files = await walk(fileURLToPath(new URL('../commands', import.meta.url)));

	for (const file of files) {
		const command = container.resolve<Command>((await import(file)).default);
		commandStore.set(command.data.name, command);
		logger.info(`Successfully loaded command "${command.data.name}"!`);
	}
}

export function firstUpperCase(text: string, split = ' '): string {
	return text
		.split(split)
		.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join(' ');
}
