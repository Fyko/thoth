import 'reflect-metadata';

import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { config } from 'dotenv';
import { deploy } from './deploy.js';
import { generateCommandsArray } from './generate.js';
import { loadTranslations } from '#util/index.js';

process.env.NODE_ENV ??= 'development';
config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

async function main() {
	await loadTranslations();
	const commands = await generateCommandsArray();

	void deploy(commands);
}

void main();
