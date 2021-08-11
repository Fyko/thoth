import 'reflect-metadata';
process.env.NODE_ENV ??= 'development';

import { config } from 'dotenv-cra';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../.env') });

import { deploy } from './deploy';
import { loadCommands } from '#util/index';
import Collection from '@discordjs/collection';
import type { Command } from '#structures';

async function main() {
	const commands = new Collection<string, Command>();
	await loadCommands(commands);

	void deploy(
		commands.map((c) => c.data),
		true,
	);
}

void main();
