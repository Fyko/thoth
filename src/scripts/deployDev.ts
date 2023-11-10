import 'reflect-metadata';

import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { config } from 'dotenv';
import { loadTranslations } from '#util/index.js';
import { deploy } from './deploy.js';
import { generateCommandsArray } from './generate.js';

process.env.NODE_ENV ??= 'development';
config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

async function main() {
	await loadTranslations(fileURLToPath(new URL('../locales', import.meta.url)));
	const commands = await generateCommandsArray();

	void deploy(commands, true);
}

void main();
