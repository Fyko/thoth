/* eslint-disable promise/prefer-await-to-callbacks */
import 'reflect-metadata';

import * as crypto from 'node:crypto';
import type { IncomingMessage, Server, ServerResponse } from 'node:http';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { Collection } from '@discordjs/collection';
import { InteractionType } from 'discord-api-types/v10';
import type { APIInteraction, RESTGetAPIUserResult } from 'discord-api-types/v10';
import { verify as verifyKey } from 'discord-verify/node';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { fastify } from 'fastify';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { container } from 'tsyringe';
import { logger } from '#logger';
import type { Command } from '#structures';
import { REST } from '#structures';
import { loadCommands } from '#util/index.js';
import { kCommands, kREST } from '#util/symbols.js';

process.env.NODE_ENV ??= 'development';

const commands = new Collection<string, Command>();
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);
const metrics = new CloudWatchClient({ region: 'us-west-2' });

container.register(kCommands, { useValue: commands });
container.register(kREST, { useValue: rest });

async function verify(req: FastifyRequest, reply: FastifyReply, done: () => void) {
	const signature = req.headers['x-signature-ed25519'];
	const timestamp = req.headers['x-signature-timestamp'];
	const rawBody = JSON.stringify(req.body);

	if (!signature || !timestamp) return reply.status(401).send();

	const isValid = await verifyKey(
		rawBody,
		signature as string,
		timestamp as string,
		process.env.DISCORD_PUBKEY!,
		crypto.webcrypto.subtle,
	);

	if (!isValid) return reply.status(401).send();

	done();
}

const publishDataPoint = async (metric: string, command: string, success: boolean) => {
	const cmd = new PutMetricDataCommand({
		MetricData: [
			{
				MetricName: metric,
				Dimensions: [
					{
						Name: 'command',
						Value: command,
					},
					{
						Name: 'success',
						Value: success ? 'true' : 'false',
					},
				],
				Unit: 'None',
				Timestamp: new Date(),
				Value: 1,
			},
		],
		Namespace: 'thoth',
	});

	return metrics.send(cmd);
};

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

	const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify();

	server.post('/interactions', { preHandler: verify }, async (req, res) => {
		try {
			const message = req.body as APIInteraction;

			if (message.type === InteractionType.Ping) {
				return await res.status(200).header('Content-Type', 'application/json').send({ type: InteractionType.Ping });
			}

			if (message.type === InteractionType.ApplicationCommand) {
				const name = message.data.name;
				const command = commands.get(name);
				if (command) {
					const user = message.user ?? message.member?.user;
					const info = `command "${name}"; triggered by ${user?.username}#${user?.discriminator} (${user?.id})`;
					logger.info(`Executing ${info}`);

					try {
						await command.exec(res, message, message.locale);
						logger.info(`Successfully executed ${info}`);
						void publishDataPoint('commands', name, true);
					} catch (error) {
						logger.error(`Failed to execute ${info}`, error);
						void publishDataPoint('commands', name, false);
					}
				}
			}
		} catch {}
	});

	const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 2_399;

	server.listen({ port, host: '0.0.0.0' }, (err: Error | null, adress) => {
		if (err) logger.error('An error occurred starting the server: ', err);
		else logger.info(`Server started at ${adress}`);
	});

	const me = (await rest.get('/users/@me')) as RESTGetAPIUserResult;
	logger.info(`token provided for ${me.username}#${me.discriminator} (${me.id})`);
}

void start();
