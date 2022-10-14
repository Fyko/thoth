import 'reflect-metadata';

import { resolve } from 'node:path';
import { Collection } from '@discordjs/collection';
import { config } from 'dotenv-cra';
import { deploy } from './deploy';
import type { Command } from '#structures';
import { loadCommands } from '#util/index';

process.env.NODE_ENV ??= 'development';
config({ path: resolve(__dirname, '../../.env') });

async function main() {
	const commands = new Collection<string, Command>();
	await loadCommands(commands);

	void deploy(
		commands.map((c) => c.data),
		true,
	);
}

void main();
