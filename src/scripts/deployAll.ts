import 'reflect-metadata';

import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { Collection } from '@discordjs/collection';
import { config } from 'dotenv';
import { deploy } from './deploy.js';
import type { Command } from '#structures';
import { loadCommands } from '#util/index.js';

process.env.NODE_ENV ??= 'development';
config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

async function main() {
	const commands = new Collection<string, Command>();
	await loadCommands(commands);
	const mapped = commands.filter((c) => !c.data.dev).map((c) => c.data);
	console.dir(mapped.map((x) => x.name));
	process.exit();

	void deploy(mapped);
}

void main();
