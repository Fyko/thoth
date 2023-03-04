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

async function main() {
	await loadTranslations();

	const commands = (await generateCommandsArray()).filter((cmd) => !cmd.dev);
	return writeFile(join(process.cwd(), 'commands.lock.json'), JSON.stringify(commands, null, 2));
}

void main();
