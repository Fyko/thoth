import { extname } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { scan } from 'fs-nextra';
import { t } from 'i18next';

export const LANGUAGES = ['en-US', 'en-GB', 'de', 'es-ES', 'ja', 'ko', 'pl', 'zh-CN', 'zh-TW'];

/**
 * Fetches all localizations for a given key, returning an object with the language as the key and the translation as the value.
 *
 * @param key The key to fetch all localizations for
 * @returns An object with the language as the key and the translation as the value
 */
export function fetchDataLocalizations(key: string): Record<string, string> {
	return LANGUAGES.reduce((acc, lng) => {
		Reflect.set(acc, lng, t(key, { lng }));

		return acc;
	}, {});
}

async function walk(path: string) {
	return (
		await scan(path, {
			filter: (stats, path) =>
				stats.isFile() && ['.js', '.js'].includes(extname(stats.name)) && !path.includes('sub'),
		})
	).keys();
}

export async function generateCommandsArray(): Promise<Record<string, unknown>[]> {
	const path = fileURLToPath(new URL('commands', import.meta.url));
	const files = await walk(path);

	const commands: Record<string, unknown>[] = [];
	for (const file of files) {
		const { default: command } = await import(file);
		commands.push(command);
	}

	return commands;
}
