import type WordOfTheDayCommand from '@thoth/interactions/commands/general/word-of-the-day';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import i18n from 'i18next';
import type { Entry } from 'mw-collegiate';
import type { Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import { fetchDefinition } from '#mw';
import { fetchQuiz, generateQuiz } from '#mw/quiz.js';
import { createWOTDContent, fetchWordOfTheDay } from '#mw/wotd.js';
import { RedisManager, DismissableAlertModule } from '#structures';
import { kRedis, kSQL } from '#util/symbols.js';

@injectable()
export default class<Cmd extends typeof WordOfTheDayCommand> extends Command<Cmd> {
	public constructor(
		@inject(kRedis) public readonly redis: RedisManager,
		@inject(kSQL) public readonly sql: Sql<any>,
		@inject(DismissableAlertModule) public readonly dismissableAlertService: DismissableAlertModule,
	) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<Cmd>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? false });
		const word = await fetchWordOfTheDay(this.redis);

		const [defRes] = await fetchDefinition(this.redis, word);
		if (defRes instanceof String) {
			throw new TypeError(i18n.t('common.errors.not_found', { lng }));
		}

		const content = createWOTDContent(defRes as Entry, lng);

		// look up wotd_history row for quiz button
		const [historyRow] = await this.sql<{ id: string }[]>`
			SELECT id FROM wotd_history WHERE word = ${word}
		`;

		let components: ActionRowBuilder<ButtonBuilder>[] = [];

		if (historyRow) {
			// check if quiz exists, generate if not (lazy generation for testing / older words)
			let quiz = await fetchQuiz(this.sql, historyRow.id);
			if (!quiz) {
				try {
					quiz = await generateQuiz(this.sql, word, historyRow.id, defRes as Entry);
				} catch (error) {
					logger.error(error, 'Failed to generate quiz from wotd command');
				}
			}

			if (quiz) {
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(`wotd-quiz:${historyRow.id}`)
							.setLabel('Quiz Me!')
							.setStyle(ButtonStyle.Primary)
							.setEmoji('🧠'),
					),
				];
			}
		}

		await interaction.editReply({ content, components: components as any });
	}
}
