import { logger } from '#logger';
import type { Command, Listener } from '#structures';
import type Collection from '@discordjs/collection';
import type { APIPartialEmoji } from 'discord-api-types/v9';
import { scan } from 'fs-nextra';
import { extname, join } from 'path';
import { container } from 'tsyringe';

export * from './symbols';
export * from './types';

export function transformEmojiString(emoji: string): APIPartialEmoji | null {
	const regex = /<?(?<animated>a)?:?(?<name>\w{2,32}):(?<id>\d{17,19})>?/;
	const exec = regex.exec(emoji);
	if (!exec) return null;

	const {
		groups: { name, id, animated },
	} = exec as RegExpExecArray & { groups: Record<'name' | 'id', string> & { animated?: string } };

	return {
		name,
		id,
		animated: animated ? true : false,
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

export function trimArray(arr: any[], maxLen = 10): any[] {
	if (arr.length > maxLen) {
		const len = arr.length - maxLen;
		arr = arr.slice(0, maxLen);
		arr.push(`${len} more...`);
	}
	return arr;
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
	const files = await walk(join(__dirname, '..', 'commands'));

	for (const file of files) {
		const command = container.resolve<Command>((await import(file)).default);
		commandStore.set(command.data.name, command);
		logger.info(`Successfully loaded command "${command.data.name}"!`);
	}
}

export async function loadListeners(listenerStore: Collection<string, Listener>) {
	const files = await walk(join(__dirname, '..', 'events'));

	for (const file of files) {
		const listener = container.resolve<Listener>((await import(file)).default);
		listenerStore.set(listener.event, listener);
		listener.exec();
		logger.info(`Successfully loaded listener "${listener.event}"!`);
	}
}

export function firstUpperCase(text: string, split = ' '): string {
	return text
		.split(split)
		.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join(' ');
}
