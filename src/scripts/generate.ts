import 'reflect-metadata';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { config } from 'dotenv';
import { loadTranslations, walk } from '#util/index.js';

process.env.NODE_ENV ??= 'development';
config({ path: join(process.cwd(), '.env') });

export async function generateCommandsArray(): Promise<Record<string, unknown>[]> {
	const path = fileURLToPath(new URL('../interactions/commands', import.meta.url));
	const files = await walk(path);

	const commands: Record<string, unknown>[] = [];
	for (const file of files) {
		const { default: command } = await import(file);
		commands.push(command);
	}

	return commands;
}

console.log('Generating commands array...');
await loadTranslations(fileURLToPath(new URL('../locales', import.meta.url)));

const commands = (await generateCommandsArray()).filter((cmd) => !cmd.dev);
const path = join(process.cwd(), 'commands.lock.json');
console.log(`Writing commands array to ${path}...`);
writeFile(path, JSON.stringify(commands, null, 2));
