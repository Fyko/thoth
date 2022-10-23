import 'reflect-metadata';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { Collection } from '@discordjs/collection';
import { config } from 'dotenv';
import { container } from 'tsyringe';
import type { Command} from '#structures';
import { RedisManager, REST } from '#structures';
import { kRedis, kREST, loadCommands, loadTranslations } from '#util/index.js';

process.env.NODE_ENV ??= 'development';
config({ path: join(process.cwd(), '.env') });

const redis = new RedisManager({ host: 'localhost', port: 6_379 });
const rest = new REST({ version: '9' });
container.register(kRedis, { useValue: redis });
container.register(kREST, { useValue: rest });

async function main() {
	await loadTranslations();
	const commands = new Collection<string, Command>();
	await loadCommands(commands, true);

	const mapped = commands.filter((c) => !c.data.dev).map((c) => c.data);

	await writeFile(join(process.cwd(), 'commands.lock.json'), JSON.stringify(mapped, null, 2));
}

void main();
