import process from 'node:process';
import { DiscordAPIError } from '@discordjs/rest';
import { Queue, Worker, type Job } from "bullmq";
import { Routes } from 'discord-api-types/v10';
import type { Entry } from 'mw-collegiate';
import type { Sql } from "postgres";
import Parser from 'rss-parser';
import { container } from "tsyringe";
import { fetch } from 'undici';
import type { RedisManager } from './structures/RedisManager.js';
import type { WOTDConfig } from '#util/index.js';
import { logger } from '#util/logger.js';
import { fetchDefinition } from '#util/mw/index.js';
import { createWOTDContent } from '#util/mw/wotd.js';
import { kRedis, kSQL } from "#util/symbols.js";

export async function setupJobs() {
	const sql = container.resolve<Sql<any>>(kSQL);
	const redis = container.resolve<RedisManager>(kRedis);
	const connection = { host: process.env.REDIS_HOST, port: Number.parseInt(process.env.REDIS_PORT!, 10) };

	const queue = new Queue<{}, {}, "ensure_wotd_webhooks" | "wotd">("jobs", { connection });
	const pattern = '* * * * *';
	queue.add('wotd', {}, { repeat: { pattern } });
	queue.add('ensure_wotd_webhooks', {}, { repeat: { pattern: '0 */2 * * *' } });

	const rssParser = new Parser();
	new Worker(queue.name, async (job: Job) => {
		switch (job.name) {
			case "ensure_wotd_webhooks": {
				const cursor = sql`select * from wotd`.cursor();
				for await (const [row] of cursor) {
					const config = row as WOTDConfig;

					try {
						await fetch(`https://discord.com/api/v10${Routes.webhook(config.webhook_id.toString(), config.webhook_token)}`);
					} catch (error: unknown) {
						logger.error(`webhook error: ${error}`);
						if (error instanceof DiscordAPIError && error.status === 404) {
							await sql`
								DELETE FROM wotd WHERE id = ${config.id};
							`;
						}
					}
				}

				break;
			}

			case "wotd": {
				const url = 'https://www.merriam-webster.com/wotd/feed/rss2';
				const parsed = await rssParser.parseURL(url);

				// determine if any of the words are new
				const words = parsed.items.map((item) => item.title!);
				const existing = await sql<{ word: string }[]>`
					SELECT word FROM wotd_history WHERE word = ANY(${words})
				`;
				const newWords = words.filter((word) => !existing.some((e) => e.word === word));

				if (newWords.length === 0) break;

				logger.info(`found new words: ${newWords.join(', ')}`);

				// insert the new words
				await sql`
					INSERT INTO wotd_history ${sql(newWords.map(w => ({ word: w })))};
				`;

				// fetch the definitions for the new words
				const definition = await fetchDefinition(redis, newWords[0]);
				const content = createWOTDContent(definition[0] as Entry, 'en');

				// fetch all the wotd configts
				const configs = await sql<WOTDConfig[]>`
					SELECT * FROM wotd;
				`;

				// send the webhook
				for (const server of configs) {
					try {
						await fetch(`https://discord.com/api/v10${Routes.webhook(server.webhook_id.toString(), server.webhook_token)}`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								content: `Merrium Webster published a new word of the day!\n\n${content}`,
							}),
						});
					} catch (error: unknown) {
						logger.error(`posting message error: ${error}`);
						if (error instanceof DiscordAPIError && error.status === 404) {
							await sql`
								DELETE FROM wotd WHERE id = ${server.id};
							`;

							// TODO: send message to created_by to alert failure
						}
					}
				}
			}
		}
	}, { connection });

	return queue;
}
