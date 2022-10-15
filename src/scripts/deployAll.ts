import 'reflect-metadata';

import { resolve } from 'node:path';
import process from 'node:process';
import { Collection } from '@discordjs/collection';
import { config } from 'dotenv-cra';
import { loadCommands } from '../util/index.js';
import { deploy } from './deploy.js';
import type { Command } from '#structures';

process.env.NODE_ENV ??= 'development';
config({ path: resolve(__dirname, '../../.env') });

async function main() {
	const commands = new Collection<string, Command>();
	await loadCommands(commands);

	void deploy(commands.map((c) => c.data));
}

void main();
