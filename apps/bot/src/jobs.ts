import process from 'node:process';
import { inlineCode } from '@discordjs/builders';
import { Queue, Worker, type Job } from 'bullmq';
import { stripIndents } from 'common-tags';
import { WebhookClient, DiscordAPIError, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client } from 'discord.js';
import type { Entry } from 'mw-collegiate';
import type { Sql } from 'postgres';
import Parser from 'rss-parser';
import { container } from 'tsyringe';
import { logger } from '#logger';
import type { EntitlementCache } from '#structures';
import type { WOTDConfig } from '#util/index.js';
import { fetchDefinition } from '#util/mw/index.js';
import { generateQuiz, type QuizOption } from '#util/mw/quiz.js';
import { createWOTDContent } from '#util/mw/wotd.js';
import { kEntitlementCache, kRedis, kSQL } from '#util/symbols.js';
import type { RedisManager } from './structures/RedisManager.js';

const statusWebhook = new WebhookClient({
	url: process.env.COMMAND_LOG_WEBHOOK_URL!,
});

function buildQuizComponents(wotdHistoryId: string): ActionRowBuilder<ButtonBuilder>[] {
	return [
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`wotd-quiz:${wotdHistoryId}`)
				.setLabel('Quiz Me!')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('🧠'),
		),
	];
}

interface Status {
	deleted?: boolean;
	error?: Error;
	guildId: string;
	webhookId: string;
}

async function deliverToGuild(
	sql: Sql<any>,
	server: WOTDConfig,
	content: string,
	components: ActionRowBuilder<ButtonBuilder>[],
	pendingId: string,
): Promise<Status> {
	const client = new WebhookClient({
		id: server.webhook_id.toString(),
		token: server.webhook_token,
	});

	try {
		await client.send({ content, components });
		await sql`
			INSERT INTO wotd_delivery_log (wotd_pending_id, wotd_config_id)
			VALUES (${pendingId}, ${server.id})
			ON CONFLICT (wotd_pending_id, wotd_config_id) DO NOTHING
		`;
		return { guildId: server.guild_id.toString(), webhookId: server.webhook_id.toString() };
	} catch (error: unknown) {
		logger.error(error, 'posting message error');
		const entry: Status = {
			error: error as Error,
			guildId: server.guild_id.toString(),
			webhookId: server.webhook_id.toString(),
		};

		if (error instanceof DiscordAPIError && error.status === 404) {
			await sql`DELETE FROM wotd WHERE id = ${server.id}`;
			entry.deleted = true;
		}

		return entry;
	}
}

async function sendStatusReport(statuses: Status[], content: string): Promise<void> {
	const successCount = statuses.filter((s) => !s.error).length;
	const errors = statuses.filter((s) => s.error);
	const errorGroups = errors.reduce<Record<string, Status[]>>((acc, curr) => {
		const name = curr.error!.name;
		if (!acc[name]) acc[name] = [];
		acc[name]!.push(curr);
		return acc;
	}, {});

	await statusWebhook.send({
		content,
		embeds: [
			{
				title: 'Status',
				fields: [
					{ name: 'Success', value: successCount.toLocaleString('en-US'), inline: true },
					{ name: 'Errors', value: errors.length.toLocaleString('en-US'), inline: true },
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

interface IngestResult {
	components: ActionRowBuilder<ButtonBuilder>[];
	content: string;
	pendingId: string;
	word: string;
}

async function ingestNewWord(sql: Sql<any>, redis: RedisManager, force: boolean): Promise<IngestResult | null> {
	const rssParser = new Parser();
	const url = 'https://www.merriam-webster.com/wotd/feed/rss2';
	const parsed = await rssParser.parseURL(url);

	const words = parsed.items.map((item) => item.title!);
	const existing = await sql<{ word: string }[]>`
		SELECT word FROM wotd_history WHERE word = ANY(${words})
	`;
	const newWords = words.filter((word) => !existing.some((e) => e.word === word));

	if (newWords.length === 0 && !force) {
		logger.info('no new words found, skipping');
		return null;
	}

	if (newWords.length > 0) {
		logger.info(`found new words: ${newWords.join(', ')}`);
		await sql`INSERT INTO wotd_history ${sql(newWords.map((word) => ({ word })))}`;
	}

	const lastWord = await sql<{ word: string }[]>`
		SELECT word FROM wotd_history ORDER BY created_at DESC LIMIT 1
	`;
	const word = newWords.length > 0 ? newWords[0]! : lastWord[0]!.word;

	const definition = await fetchDefinition(redis, word);
	const content = createWOTDContent(definition[0] as Entry, 'en');

	const [historyRow] = await sql<[{ id: string }]>`SELECT id FROM wotd_history WHERE word = ${word}`;

	// check if pending already exists for this word
	const [existingPending] = await sql<{ id: string }[]>`
		SELECT id FROM wotd_pending WHERE wotd_history_id = ${historyRow.id}
	`;

	if (existingPending) {
		const quiz = await fetchExistingQuiz(sql, historyRow.id);
		const components = quiz ? buildQuizComponents(historyRow.id) : [];
		return {
			word,
			content: stripIndents`
				Merriam Webster published a new word of the day!

				${content}
			`,
			components,
			pendingId: existingPending.id,
		};
	}

	let quiz: QuizOption[] | null = null;
	try {
		quiz = await generateQuiz(sql, word, historyRow.id, definition[0] as Entry);
	} catch (error) {
		logger.error(error, 'Failed to generate WOTD quiz');
	}

	const components = quiz ? buildQuizComponents(historyRow.id) : [];
	const fullContent = stripIndents`
		Merriam Webster published a new word of the day!

		${content}
	`;

	const [pending] = await sql<[{ id: string }]>`
		INSERT INTO wotd_pending (wotd_history_id, content, components)
		VALUES (${historyRow.id}, ${fullContent}, ${JSON.stringify(components.map((r) => r.toJSON()))})
		RETURNING id
	`;

	return { word, content: fullContent, components, pendingId: pending.id };
}

async function fetchExistingQuiz(sql: Sql<any>, historyId: string): Promise<boolean> {
	const rows = await sql`SELECT id FROM wotd_quiz_option WHERE wotd_history_id = ${historyId} LIMIT 1`;
	return rows.length > 0;
}

export async function triggerWOTD(force = false): Promise<void> {
	const sql = container.resolve<Sql<any>>(kSQL);
	const redis = container.resolve<RedisManager>(kRedis);

	const result = await ingestNewWord(sql, redis, force);
	if (!result) return;

	// deliver to free guilds (no custom schedule)
	const configs = await sql<WOTDConfig[]>`
		SELECT * FROM wotd WHERE post_time IS NULL
	`;

	const statuses: Status[] = [];
	for (const server of configs) {
		const status = await deliverToGuild(sql, server, result.content, result.components, result.pendingId);
		statuses.push(status);
	}

	await sendStatusReport(statuses, result.content);
}

export async function setupJobs(): Promise<Queue<{}, {}, 'wotd-ingest' | 'wotd-deliver'>> {
	const sql = container.resolve<Sql<any>>(kSQL);
	const redis = container.resolve<RedisManager>(kRedis);
	const entitlementCache = container.resolve<EntitlementCache>(kEntitlementCache);
	const connection = {
		host: process.env.REDIS_HOST,
		port: Number.parseInt(process.env.REDIS_PORT!, 10),
	};

	const queue = new Queue<{}, {}, 'wotd-ingest' | 'wotd-deliver'>('jobs', { connection });
	const pattern = '* * * * *';
	await queue.add('wotd-ingest', {}, { repeat: { pattern } });
	await queue.add('wotd-deliver', {}, { repeat: { pattern } });

	new Worker(
		queue.name,
		async (job: Job) => {
			switch (job.name) {
				case 'wotd-ingest': {
					const result = await ingestNewWord(sql, redis, false);
					if (!result) break;

					// deliver to free guilds immediately
					const configs = await sql<WOTDConfig[]>`
						SELECT * FROM wotd WHERE post_time IS NULL
					`;

					const statuses: Status[] = [];
					for (const server of configs) {
						const status = await deliverToGuild(
							sql,
							server,
							result.content,
							result.components,
							result.pendingId,
						);
						statuses.push(status);
					}

					await sendStatusReport(statuses, result.content);
					break;
				}

				case 'wotd-deliver': {
					// find scheduled guilds that are due for delivery
					const due = await sql<
						(WOTDConfig & { components: string; pending_content: string; pending_id: string })[]
					>`
						SELECT w.*, p.id as pending_id, p.content as pending_content, p.components
						FROM wotd w
						CROSS JOIN wotd_pending p
						WHERE w.post_time IS NOT NULL
							AND w.timezone IS NOT NULL
							AND p.created_at > NOW() - INTERVAL '36 hours'
							AND (NOW() AT TIME ZONE w.timezone)::time
								BETWEEN w.post_time AND w.post_time + INTERVAL '1 minute'
							AND NOT EXISTS (
								SELECT 1 FROM wotd_delivery_log dl
								WHERE dl.wotd_pending_id = p.id AND dl.wotd_config_id = w.id
							)
					`;

					if (due.length === 0) break;

					const discordClient = container.resolve<Client<true>>(Client);

					for (const row of due) {
						const isPremium = await entitlementCache.isGuildPremium(row.guild_id.toString(), discordClient);

						if (!isPremium) {
							// subscription lapsed — reset to free tier and deliver immediately
							await sql`
								UPDATE wotd SET post_time = NULL, timezone = NULL
								WHERE id = ${row.id}
							`;
							logger.info(
								{ guildId: row.guild_id.toString() },
								'Guild subscription lapsed, reset to free tier',
							);
						}

						// deliver regardless (lapsed guilds get it now as a one-time catch-up)
						const components = JSON.parse(row.components as string);
						const rebuilt = components.map((c: any) => ActionRowBuilder.from<ButtonBuilder>(c));

						await deliverToGuild(sql, row, row.pending_content, rebuilt, row.pending_id);
					}

					// cleanup old pending rows
					await sql`DELETE FROM wotd_pending WHERE created_at < NOW() - INTERVAL '48 hours'`;
					break;
				}
			}
		},
		{ connection },
	);

	return queue;
}
