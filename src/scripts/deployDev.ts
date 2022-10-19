import 'reflect-metadata';

import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { Collection } from '@discordjs/collection';
import { config } from 'dotenv';
import { deploy } from './deploy.js';
import type { Command } from '#structures';
import { loadCommands, loadTranslations } from '#util/index.js';

process.env.NODE_ENV ??= 'development';
config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

async function main() {
	await loadTranslations();
	const commands = new Collection<string, Command>();
	await loadCommands(commands);

	void deploy(
		commands.map((c) => c.data),
		true,
	);
}

void main();
