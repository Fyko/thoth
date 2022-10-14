import 'reflect-metadata';

import { Collection } from '@discordjs/collection';
import type { Events } from 'discord.js';
import { IntentsBitField, Options, Client } from 'discord.js';
import { container } from 'tsyringe';
import type { Command, Listener} from '#structures';
import { REST, MetricsHandler } from '#structures';
import { loadCommands, loadListeners } from '#util/index';
import { kCommands, kListeners, kREST, kMetrics } from '#util/symbols';

process.env.NODE_ENV ??= 'development';

const client = new Client({
	intents: [IntentsBitField.Flags.Guilds],
	shards: 'auto',
	makeCache: Options.cacheWithLimits({
		MessageManager: 5,
	}),
});
const commands = new Collection<string, Command>();
const listeners = new Collection<Events, Listener>();
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);
const metrics = new MetricsHandler();

container.register(Client, { useValue: client });
container.register(kCommands, { useValue: commands });
container.register(kListeners, { useValue: listeners });
container.register(kREST, { useValue: rest });
container.register(kMetrics, { useValue: metrics });

async function start() {
	await loadCommands(commands);
	await loadListeners(listeners);

	await client.login();
}

void start();
