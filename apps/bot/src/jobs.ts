import process from 'node:process';
import { inlineCode } from '@discordjs/builders';
import { Queue, Worker, type Job } from 'bullmq';
import { WebhookClient, DiscordAPIError } from 'discord.js';
import type { Entry } from 'mw-collegiate';
import type { Sql } from 'postgres';
import Parser from 'rss-parser';
import { container } from 'tsyringe';
import { logger } from '#logger';
import type { WOTDConfig } from '#util/index.js';
import { fetchDefinition } from '#util/mw/index.js';
import { createWOTDContent } from '#util/mw/wotd.js';
import { kRedis, kSQL } from '#util/symbols.js';
import type { RedisManager } from './structures/RedisManager.js';

const webhook = new WebhookClient({
	url: process.env.COMMAND_LOG_WEBHOOK_URL!,
});

export async function triggerWOTD(force = false): Promise<void> {
	const sql = container.resolve<Sql<any>>(kSQL);
	const redis = container.resolve<RedisManager>(kRedis);

	const rssParser = new Parser();

	const url = 'https://www.merriam-webster.com/wotd/feed/rss2';
	const parsed = await rssParser.parseURL(url);

	// determine if any of the words are new
	const words = parsed.items.map((item) => item.title!);
	const existing = await sql<{ word: string }[]>`
		SELECT word FROM wotd_history WHERE word = ANY(${words})
	`;
	const newWords = words.filter((word) => !existing.some((existing) => existing.word === word));

	if (newWords.length === 0 && !force) {
		logger.info('no new words found, skipping');
		return;
	}

	logger.info(`found new words: ${newWords.join(', ')}`);

	// insert the new words
	await sql`
		INSERT INTO wotd_history ${sql(newWords.map((word) => ({ word })))};
	`;

	const lastWord = await sql<{ word: string }[]>`
		SELECT word FROM wotd_history ORDER BY created_at DESC LIMIT 1
	`;

	const newWord = newWords.length > 0 ? newWords[0]! : lastWord[0]!.word;

	// fetch the definitions for the new words
	const definition = await fetchDefinition(redis, newWord);
	const content = createWOTDContent(definition[0] as Entry, 'en');

	// fetch all the wotd configts
	const configs = await sql<WOTDConfig[]>`
		SELECT * FROM wotd;
	`;

	interface Status {
		deleted?: boolean;
		error?: Error;
		guildId: string;
		webhookId: string;
	}

	const statuses: Status[] = [];

	// send the webhook
	for (const server of configs) {
		const client = new WebhookClient({
			id: server.webhook_id.toString(),
			token: server.webhook_token,
		});
		try {
			await client.send({
				content: `Merriam Webster published a new word of the day!\n\n${content}`,
			});

			statuses.push({
				guildId: server.guild_id.toString(),
				webhookId: server.webhook_id.toString(),
			});
		} catch (error: unknown) {
			logger.error(error, 'posting message error');
			const entry: Status = {
				error: error as Error,
				guildId: server.guild_id.toString(),
				webhookId: server.webhook_id.toString(),
			};

			if (error instanceof DiscordAPIError && error.status === 404) {
				await sql`
					DELETE FROM wotd WHERE id = ${server.id};
				`;
				entry.deleted = true;
			}

			statuses.push(entry);
		}
	}

	// send the status webhook
	const successCount = statuses.filter((status) => !status.error).length;
	const errors = statuses.filter((status) => status.error);
	const errorGroups = errors.reduce<Record<string, Status[]>>((acc, curr) => {
		const name = curr.error!.name;
		if (!acc[name]) acc[name] = [];
		acc[name]!.push(curr);
		return acc;
	}, {});

	await webhook.send({
		content: `Merriam Webster published a new word of the day!\n\n${content}`,
		embeds: [
			{
				title: 'Status',
				fields: [
					{
						name: 'Success',
						value: successCount.toLocaleString('en-US'),
						inline: true,
					},
					{
						name: 'Errors',
						value: errors.length.toLocaleString('en-US'),
						inline: true,
					},
				],
				description: Object.entries(errorGroups)
					.map(([name, statuses]) => {
						return `**${name}**: ${inlineCode(statuses[0]!.error!.message!)} (${inlineCode(
							statuses.length.toLocaleString('en-US'),
						)})`;
					})
					.join('\n')
					.slice(0, 2_048),
			},
		],
	});
}

export async function setupJobs(): Promise<Queue<{}, {}, 'wotd'>> {
	const sql = container.resolve<Sql<any>>(kSQL);
	const redis = container.resolve<RedisManager>(kRedis);
	const connection = {
		host: process.env.REDIS_HOST,
		port: Number.parseInt(process.env.REDIS_PORT!, 10),
	};

	const queue = new Queue<{}, {}, 'wotd'>('jobs', { connection });
	const pattern = '* * * * *';
	await queue.add('wotd', {}, { repeat: { pattern } });
	const rssParser = new Parser();

	new Worker(
		queue.name,
		async (job: Job) => {
			switch (job.name) {
				case 'wotd': {
					const url = 'https://www.merriam-webster.com/wotd/feed/rss2';
					const parsed = await rssParser.parseURL(url);

					// determine if any of the words are new
					const words = parsed.items.map((item) => item.title!);
					const existing = await sql<{ word: string }[]>`
						SELECT word FROM wotd_history WHERE word = ANY(${words})
					`;
					const newWords = words.filter((word) => !existing.some((existing) => existing.word === word));

					if (newWords.length === 0) break;

					logger.info(`found new words: ${newWords.join(', ')}`);

					// insert the new words
					await sql`
						INSERT INTO wotd_history ${sql(newWords.map((word) => ({ word })))};
					`;

					// fetch the definitions for the new words
					const definition = await fetchDefinition(redis, newWords[0]!);
					const content = createWOTDContent(definition[0] as Entry, 'en');

					// fetch all the wotd configts
					const configs = await sql<WOTDConfig[]>`
						SELECT * FROM wotd;
					`;

					interface Status {
						deleted?: boolean;
						error?: Error;
						guildId: string;
						webhookId: string;
					}

					const statuses: Status[] = [];

					// send the webhook
					for (const server of configs) {
						const client = new WebhookClient({
							id: server.webhook_id.toString(),
							token: server.webhook_token,
						});
						try {
							await client.send({
								content: `Merriam Webster published a new word of the day!\n\n${content}`,
							});

							statuses.push({
								guildId: server.guild_id.toString(),
								webhookId: server.webhook_id.toString(),
							});
						} catch (error: unknown) {
							logger.error(error, 'posting message error');
							const entry: Status = {
								error: error as Error,
								guildId: server.guild_id.toString(),
								webhookId: server.webhook_id.toString(),
							};

							if (error instanceof DiscordAPIError && error.status === 404) {
								await sql`
									DELETE FROM wotd WHERE id = ${server.id};
								`;
								entry.deleted = true;
							}

							statuses.push(entry);
						}
					}

					// send the status webhook
					const successCount = statuses.filter((status) => !status.error).length;
					const errors = statuses.filter((status) => status.error);
					const errorGroups = errors.reduce<Record<string, Status[]>>((acc, curr) => {
						const name = curr.error!.name;
						if (!acc[name]) acc[name] = [];
						acc[name]!.push(curr);
						return acc;
					}, {});

					await webhook.send({
						content: `Merriam Webster published a new word of the day!\n\n${content}`,
						embeds: [
							{
								title: 'Status',
								fields: [
									{
										name: 'Success',
										value: successCount.toLocaleString('en-US'),
										inline: true,
									},
									{
										name: 'Errors',
										value: errors.length.toLocaleString('en-US'),
										inline: true,
									},
								],
								description: Object.entries(errorGroups)
									.map(([name, statuses]) => {
										return `**${name}**: ${inlineCode(statuses[0]!.error!.message!)} (${inlineCode(
											statuses.length.toLocaleString('en-US'),
										)})`;
									})
									.join('\n')
									.slice(0, 2_048),
							},
						],
					});
				}
			}
		},
		{ connection },
	);

	return queue;
}
