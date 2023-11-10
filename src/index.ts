import 'reflect-metadata';

import type { IncomingMessage, Server, ServerResponse } from 'node:http';
import process from 'node:process';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import type { Command } from '@yuudachi/framework';
import { commandInfo, createClient, createCommands, dynamicImport, kCommands } from '@yuudachi/framework';
import type { Event } from '@yuudachi/framework/types';
import { IntentsBitField, Options } from 'discord.js';
import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';
import fastifyMetrics, { type IMetricsPluginOptions } from 'fastify-metrics';
import postgres from 'postgres';
import { Gauge } from 'prom-client';
import readdirp from 'readdirp';
import { container } from 'tsyringe';
import { logger } from '#logger';
import { RedisManager } from '#structures';
import { loadTranslations } from '#util/index.js';
import { kGuildCountGuage, kRedis, kSQL } from '#util/symbols.js';
import { setupJobs } from './jobs.js';

// overwrite the process.env def to include PORT: string
declare global {
	namespace NodeJS {
		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
		interface ProcessEnv {
			COMMAND_LOG_WEBHOOK_URL: string;
			DATABASE_URL: string;
			DISCORD_APPLICATION_ID: string;
			DISCORD_TOKEN: string;
			GUILD_LOG_WEBHOOK_URL: string;
			PORT: string;
			PRIVACY_URL: string;
			REDIS_HOST: string;
			REDIS_PORT: string;
			TERMS_URL: string;
		}
	}
}

process.env.NODE_ENV ??= 'development';

createCommands();

const redis = new RedisManager({ host: process.env.REDIS_HOST, port: Number.parseInt(process.env.REDIS_PORT, 10) });
const sql = postgres(process.env.DATABASE_URL, {
	types: {
		bigint: postgres.BigInt,
		date: {
			to: 1_184,
			from: [1_082, 1_083, 1_114, 1_184],
			serialize: (date: Date) => date.toISOString(),
			parse: (isoString: string) => isoString,
		},
	},
});

const client = createClient({
	shards: 'auto',
	intents: [IntentsBitField.Flags.Guilds],
	makeCache: Options.cacheWithLimits({
		MessageManager: 5,
		PresenceManager: 0,
	}),
});

const guildCount = new Gauge({
	name: 'thoth_metrics_guilds',
	help: 'The number of guilds',
});

createCommands();
container.register(kRedis, { useValue: redis });
container.register(kSQL, { useValue: sql });
container.register(kGuildCountGuage, { useValue: guildCount });

new Gauge({
	name: 'thoth_wotd_subscribers',
	help: 'Number of users subscribed to the Word Of the Day',
	async collect() {
		const query = await sql`SELECT COUNT(*) FROM wotd`;
		this.set(Number.parseInt(query[0]?.count ?? 0, 10));
	},
});

logger.debug('Starting Thoth');

const translationsPath = fileURLToPath(new URL('locales', import.meta.url));
await loadTranslations(translationsPath);

const commands = container.resolve<Map<string, Command>>(kCommands);
const commandFiles = readdirp(fileURLToPath(new URL('commands', import.meta.url)), {
	fileFilter: '*.js',
	directoryFilter: '!sub',
});

for await (const file of commandFiles) {
	const cmdInfo = commandInfo(file.path);

	if (!cmdInfo) continue;

	const dynamic = dynamicImport<new () => Command>(async () => import(pathToFileURL(file.fullPath).href));
	const command = container.resolve<Command>((await dynamic()).default);

	logger.info(
		{ command: { name: command.name?.join(', ') ?? cmdInfo.name } },
		`Registering command: ${command.name?.join(', ') ?? cmdInfo.name}`,
	);

	if (command.name) {
		for (const name of command.name) {
			commands.set(name.toLowerCase(), command);
		}
	} else {
		commands.set(cmdInfo.name.toLowerCase(), command);
	}
}

const eventFiles = readdirp(fileURLToPath(new URL('events', import.meta.url)), {
	fileFilter: '*.js',
});

for await (const file of eventFiles) {
	const dynamic = dynamicImport<new () => Event>(async () => import(pathToFileURL(file.fullPath).href));
	const event_ = container.resolve<Event>((await dynamic()).default);
	logger.info({ event: { name: event_.name, event: event_.event } }, `Registering event: ${event_.name}`);

	if (event_.disabled) {
		continue;
	}

	void event_.execute();
}

const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify();

// @ts-expect-error ik it works
await server.register(fastifyMetrics, {
	endpoint: '/metrics',
	defaultMetrics: { prefix: 'thoth_' },
	routeMetrics: {
		overrides: {
			histogram: { name: 'thoth_webserver_request_duration_seconds' },
			summary: { name: 'thoth_webserver_request_summary_seconds' },
		},
	},
} as IMetricsPluginOptions);
server.get('/terms', (_req, res) => res.redirect(301, process.env.TERMS_URL));
server.get('/privacy', (_req, res) => res.redirect(301, process.env.PRIVACY_URL));
server.get('/health', (_req, res) => res.send({ status: 'ok' }));

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 2_399;

const addr = await server.listen({ port, host: '0.0.0.0' });
logger.info(`Server started at ${addr}`);

await client.login();

await setupJobs();
