import 'reflect-metadata';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { Collection } from '@discordjs/collection';
import { config } from 'dotenv';
import type { Command } from '#structures';
import { loadCommands, loadTranslations } from '#util/index.js';

process.env.NODE_ENV ??= 'development';
config({ path: join(process.cwd(), '.env') });

async function main() {
	await loadTranslations();
	const commands = new Collection<string, Command>();
	await loadCommands(commands, true);

	const mapped = commands.filter((c) => !c.data.dev).map((c) => c.data);

	await writeFile(join(process.cwd(), 'commands.lock.json'), JSON.stringify(mapped, null, 2));
}

void main();
