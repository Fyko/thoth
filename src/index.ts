process.env.NODE_ENV ??= 'development';
import 'reflect-metadata';

import Collection from '@discordjs/collection';
import { Intents, Options, Client } from 'discord.js';
import { container } from 'tsyringe';
import { Command, REST, Listener } from '#structures';
import { loadCommands, loadListeners } from '#util/index';
import { kCommands, kListeners, kREST } from '#util/symbols';

const client = new Client({
	intents: [Intents.FLAGS.GUILDS],
	makeCache: Options.cacheWithLimits({
		MessageManager: 5,
	}),
});
const commands = new Collection<string, Command>();
const listeners = new Collection<string, Listener>();
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

container.register(Client, { useValue: client });
container.register(kCommands, { useValue: commands });
container.register(kListeners, { useValue: listeners });
container.register(kREST, { useValue: rest });

async function start() {
	await loadCommands(commands);
	await loadListeners(listeners);

	await client.login();
}

void start();
