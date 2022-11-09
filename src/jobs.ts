import process from 'node:process';
import { DiscordAPIError, REST } from '@discordjs/rest';
import { Queue, Worker, type Job } from "bullmq";
import type { RESTPostAPIWebhookWithTokenResult } from 'discord-api-types/v10';
import { Routes } from 'discord-api-types/v10';
import type { Entry } from 'mw-collegiate';
import type { Sql } from "postgres";
import Parser from 'rss-parser';
import { container } from "tsyringe";
import type { WOTDConfig } from '#util/index.js';
import { fetchDefinition } from '#util/mw/index.js';
import { createWOTDContent } from '#util/mw/wotd.js';
import { kSQL } from "#util/symbols.js";

export async function setupJobs() {
	const sql = container.resolve<Sql<any>>(kSQL);
	const connection = { host: process.env.REDIS_HOST, port: Number.parseInt(process.env.REDIS_PORT!, 10) };

	const queue = new Queue<{}, {}, "wotd">("jobs", { connection });
	queue.add('wotd', {}, { repeat: { pattern: '*/3 * * * *' } });
	const rssParser = new Parser();

	new Worker(queue.name, async (job: Job) => {
		switch (job.name) {
			case "wotd": {
				const parsed = await rssParser.parseURL('https://www.merriam-webster.com/wotd/feed/rss2');

				// determine if any of the words are new
				const words = parsed.items.map((item) => item.title!);
				const existing = await sql<{ word: string }[]>`
					SELECT word FROM wotd_history WHERE word = ANY(${words})
				`;

				const newWords = words.filter((word) => !existing.some((e) => e.word === word));
				if (newWords.length === 0) break

				// insert the new words
				await this.sql`
					INSERT INTO wotd_history (word) VALUES ${newWords.map((word) => [word])}
				`;

				// fetch the definitions for the new words
				const definitions = await Promise.all(newWords.map(async (word) => (await fetchDefinition(this.redis, word))[0] as Entry));
				const content = definitions.map((def) => createWOTDContent(def, 'en')).join('\n\n');

				// fetch all the wotd configts
				const configs = await sql<WOTDConfig[]>`
					SELECT * FROM wotd_config;
				`;

				// send the webhook
				for (const server of configs) {
					const client = new REST();
					try {
						await client.post(Routes.webhookMessage(server.webhook_id.toString(), server.webhook_token), {
							body: {
								content,
							},
						}) as RESTPostAPIWebhookWithTokenResult;
					} catch (error: unknown) {
						if (error instanceof DiscordAPIError && error.status === 404) {
							await sql`
								DELETE FROM wotd_config WHERE id = ${server.id};
							`;

							// TODO: send message to created_by to alert failure
						}
					}
				}
			}
		}
	}, { connection });
}
