import 'reflect-metadata';

import { createServer } from 'node:http';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { Collection } from '@discordjs/collection';
import type { Events } from 'discord.js';
import { IntentsBitField, Options, Client } from 'discord.js';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { container } from 'tsyringe';
import type { Command, Listener } from '#structures';
import { REST } from '#structures';
import { loadCommands, loadListeners } from '#util/index.js';
import { kCommands, kListeners, kREST } from '#util/symbols.js';

process.env.NODE_ENV ??= 'development';

const client = new Client({
	intents: [IntentsBitField.Flags.Guilds],
	shardCount: 16,
	makeCache: Options.cacheWithLimits({
		MessageManager: 5,
	}),
});
const commands = new Collection<string, Command>();
const listeners = new Collection<Events, Listener>();
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

container.register(Client, { useValue: client });
container.register(kCommands, { useValue: commands });
container.register(kListeners, { useValue: listeners });
container.register(kREST, { useValue: rest });

const server = createServer((_, res) => {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end('Hello World');
});
server.listen(8_080);

async function start() {
	await i18next.use(Backend).init({
		backend: {
			loadPath: fileURLToPath(new URL('locales/{{lng}}/{{ns}}.json', import.meta.url)),
		},
		cleanCode: true,
		fallbackLng: ['en-US'],
		defaultNS: 'translation',
		lng: 'en-US',
		ns: ['translation'],
	});

	await loadCommands(commands);
	await loadListeners(listeners);

	await client.login();
}

void start();
