import { randomBytes } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import process from 'node:process';
import type { Command } from '@yuudachi/framework';
import {
	transformApplicationInteraction,
	kCommands,
	createModalActionRow,
	createTextComponent,
} from '@yuudachi/framework';
import type { Event } from '@yuudachi/framework/types';
import { stripIndents } from 'common-tags';
import { ButtonStyle } from 'discord-api-types/v10';
import type {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	DiscordAPIError,
	ForumChannel,
	Interaction,
	ModalSubmitInteraction,
} from 'discord.js';
import {
	ActionRowBuilder,
	ApplicationCommandType,
	bold,
	ButtonBuilder,
	channelMention,
	ChannelType,
	Client,
	codeBlock,
	Colors,
	CommandInteraction,
	ContainerBuilder,
	Events,
	inlineCode,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
	TextInputStyle,
	WebhookClient,
} from 'discord.js';
import { t } from 'i18next';
import type { Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import { RedisManager } from '#structures';
import { CommandError } from '#util/error.js';
import { fetchQuiz } from '#util/mw/quiz.js';
import { kRedis, kSQL } from '#util/symbols.js';
import { definitionAutoComplete } from '../autocomplete/definition.js';
import { timezoneAutoComplete } from '../autocomplete/timezone.js';
import { fetchFeedbackRow } from '../functions/feedback.js';
import { track } from '../metrics/index.js';

@injectable()
export default class implements Event {
	public name = 'Interaction handling';

	public event = Events.InteractionCreate as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kSQL) public readonly sql: Sql<any>,
		@inject(kCommands) public readonly commands: Map<string, Command>,
		@inject(kRedis) public readonly redis: RedisManager,
	) {}

	public execute(): void {
		this.client.on(this.event, async (interaction) => {
			if (interaction.isButton()) {
				return void this.handleButton(interaction as ButtonInteraction<'cached'>);
			}

			if (interaction.isModalSubmit()) {
				return void this.handleModalSubmit(interaction as ModalSubmitInteraction<'cached'>);
			}

			if (!interaction.isCommand() && !interaction.isAutocomplete()) {
				return;
			}

			const commandId = interaction.commandName.toLowerCase();
			const command = this.commands.get(commandId);
			logger.debug(`Received interaction ${commandId}`);

			if (command) {
				const startedAt = performance.now();
				try {
					if (interaction.commandType === ApplicationCommandType.ChatInput) {
						const autocomplete = interaction.isAutocomplete();
						logger.info(
							{
								command: {
									name: interaction.commandName,
									type: interaction.type,
								},
								userId: interaction.user.id,
							},
							`Executing ${autocomplete ? 'autocomplete for' : 'chat input'} command ${
								interaction.commandName
							}`,
						);

						if (autocomplete) {
							try {
								if (interaction.commandName === 'definition') {
									await definitionAutoComplete(interaction as AutocompleteInteraction<'cached'>);
									return;
								}

								if (interaction.commandName === 'config') {
									await timezoneAutoComplete(interaction as AutocompleteInteraction<'cached'>);
									return;
								}
							} catch (error_: unknown) {
								const error = error_ as Error;
								logger.error(error, 'Error while executing autocomplete');
							}

							return;
						}

						await command.chatInput(
							interaction as ChatInputCommandInteraction<'cached'>,
							transformApplicationInteraction(interaction.options.data),
							interaction.locale,
						);

						logInteraction(interaction);

						track().commandInvoked(interaction.user.id, interaction.guildId, {
							command: interaction.commandName,
							success: true,
							durationMs: Math.round(performance.now() - startedAt),
						});
					}
				} catch (error) {
					const isCommandError = error instanceof CommandError;
					const err = error as Error;

					if (isCommandError) logger.warn(err, err.message);
					else logger.error(err, 'Error while executing command');

					logInteraction(interaction, err);

					track().commandInvoked(interaction.user.id, interaction.guildId, {
						command: interaction.commandName,
						success: false,
						durationMs: Math.round(performance.now() - startedAt),
					});

					if (interaction.isAutocomplete()) return;

					try {
						if (!interaction.deferred && !interaction.replied) {
							logger.warn(
								{
									command: {
										name: interaction.commandName,
										type: interaction.type,
									},
									userId: interaction.user.id,
								},
								'Command interaction has not been deferred before throwing',
							);
							await interaction.deferReply({ ephemeral: true });
						}

						await interaction.editReply({
							content: err.message,
							components: [],
						});
					} catch (error) {
						const sub = error as Error;
						logger.error(sub, 'Error while sending error message (lol)');
					}
				}
			}
		});
	}

	private async handleButton(interaction: ButtonInteraction<'cached'>): Promise<void> {
		track().buttonClicked(interaction.user.id, interaction.guildId, {
			customId: interaction.customId,
		});
		const lng = interaction.locale;

		// match to the regex feedback:bug | feedback:feature | feedback:general
		const feedbackSubmitRes = /^feedback:(?<type>bug|feature|general)$/.exec(interaction.customId);
		if (feedbackSubmitRes) {
			const type = feedbackSubmitRes.groups!.type!;

			return interaction.showModal({
				title: t(`commands.feedback.meta.args.category.choices.${type}`, { lng }),
				custom_id: `feedback:${type}:submit`,
				components: [
					createModalActionRow([
						createTextComponent({
							customId: 'subject',
							style: TextInputStyle.Short,
							label: t('common.titles.subject', { lng }),
							required: false,
						}),
					]),
					createModalActionRow([
						createTextComponent({
							customId: 'description',
							style: TextInputStyle.Paragraph,
							label: t('common.titles.description', { lng }),
							required: true,
						}),
					]),
				],
			});
		}

		// initial dm from owner to user
		const feedbackDmRes = /^feedback:dm:(?<submissionId>[^:]+)$/.exec(interaction.customId);
		if (feedbackDmRes) {
			const submissionId = feedbackDmRes.groups!.submissionId!;
			const row = await fetchFeedbackRow(submissionId);
			if (!row) {
				return void interaction.editReply({
					content: 'Row not found',
				});
			}

			const user = await this.client.users.fetch(row.user_id);
			const randomId = randomBytes(8).toString('hex');

			await interaction.showModal({
				title: `DM to ${user.tag}`,
				custom_id: randomId,
				components: [
					createModalActionRow([
						createTextComponent({
							label: 'DM Content (auto signature)',
							placeholder: 'Hello!',
							style: TextInputStyle.Paragraph,
							customId: 'content',
						}),
					]),
				],
			});

			const collected = await interaction
				.awaitModalSubmit({
					filter: (collected) => collected.user.id === interaction.user.id && collected.customId === randomId,
					time: 120_000, // 2 minutes
				})
				.catch(async () => {
					try {
						await interaction.editReply({
							content: 'You took too long to respond',
							components: [],
						});
					} catch (error_) {
						const error = error_ as Error;
						logger.error(error, error.message);
					}

					return undefined;
				});

			if (!collected) return;

			const content = collected.fields.getTextInputValue('content');
			if (!content.length)
				return void collected.editReply({ content: 'Content cannot be empty', components: [] });
			try {
				await user.send({
					content: stripIndents`
						Your feedback submission titled "${row.subject?.length ? row.subject : 'No Subject'}" received a message:
						
						${content}
						\- ${interaction.user.globalName ?? interaction.user.tag}
					`,
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setCustomId(`feedback:dm:reply:${submissionId}`)
								.setLabel('Reply')
								.setStyle(ButtonStyle.Secondary),
						),
					],
				});

				await interaction.channel?.send({
					content: `📤 ${content}`,
				});

				return void collected.editReply({
					content: 'OK!',
				});
			} catch (error_) {
				const error = error_ as DiscordAPIError;
				logger.warn(error, 'Error while sending DM');

				return void collected.editReply({
					content: `Error while sending DM to user: ${error.message}`,
					components: [],
				});
			}
		}

		// wotd quiz: user clicks "Quiz Me!" button on wotd message
		const wotdQuizRes = /^wotd-quiz:(?<historyId>[\da-f-]+)$/.exec(interaction.customId);
		if (wotdQuizRes) {
			const historyId = wotdQuizRes.groups!.historyId!;

			try {
				const quiz = await fetchQuiz(this.sql, historyId);
				if (!quiz) {
					return void interaction.reply({
						content: 'Sorry, the quiz for this word is not available.',
						ephemeral: true,
					});
				}

				// fetch the word for display
				const [historyRow] = await this.sql<[{ word: string }]>`
					SELECT word FROM wotd_history WHERE id = ${historyId}
				`;
				const word = historyRow?.word ?? 'this word';

				const optionIds = quiz.map((o) => o.id);

				// check if user already attempted
				const existing = await this.sql<{ option_id: string }[]>`
					SELECT option_id FROM wotd_quiz_attempt
					WHERE option_id = ANY(${optionIds}) AND user_id = ${interaction.user.id}
					LIMIT 1
				`;

				if (existing.length > 0) {
					const chosenOption = quiz.find((o) => o.id === existing[0]!.option_id)!;
					const correctOption = quiz.find((o) => o.correct)!;
					const correctIndex = quiz.indexOf(correctOption) + 1;

					const container = new ContainerBuilder()
						.setAccentColor(chosenOption.correct ? Colors.Green : Colors.Red)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								chosenOption.correct
									? stripIndents`
										### Quiz: ${word}
										You already answered this correctly! The answer was sentence **${correctIndex}**.

										${correctOption.explanation}
									`
									: stripIndents`
										### ❌ Quiz: ${word}
										You already attempted this quiz. The correct answer was sentence **${correctIndex}**.

										${correctOption.explanation}
									`,
							),
						);

					return void interaction.reply({
						components: [container],
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
					});
				}

				const numbered = quiz.map((o, i) => `**${i + 1}.** ${o.sentence}`).join('\n');

				const container = new ContainerBuilder()
					.setAccentColor(Colors.Blurple)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(stripIndents`
							### Word of the Day Quiz
							Which sentence uses **${word}** correctly?
						`),
					)
					.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(new TextDisplayBuilder().setContent(numbered))
					.addActionRowComponents(
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							quiz.map((o, i) =>
								new ButtonBuilder()
									.setCustomId(`wotd-answer:${o.id}`)
									.setLabel(`${i + 1}`)
									.setStyle(ButtonStyle.Secondary),
							),
						),
					);

				return void interaction.reply({
					components: [container],
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			} catch (error) {
				logger.error(error, 'Error handling wotd quiz button');
				return void interaction.reply({
					content: 'Something went wrong loading the quiz.',
					ephemeral: true,
				});
			}
		}

		// wotd quiz: user picks an answer
		const wotdAnswerRes = /^wotd-answer:(?<optionId>[\da-f-]+)$/.exec(interaction.customId);
		if (wotdAnswerRes) {
			const optionId = wotdAnswerRes.groups!.optionId!;

			try {
				const [chosenOption] = await this.sql<
					[
						{
							correct: boolean;
							explanation: string;
							id: string;
							sentence: string;
							word: string;
							wotd_history_id: string;
						},
					]
				>`
					SELECT qo.*, wh.word
					FROM wotd_quiz_option qo
					JOIN wotd_history wh ON wh.id = qo.wotd_history_id
					WHERE qo.id = ${optionId}
				`;

				if (!chosenOption) {
					return void interaction.update({
						content: 'Quiz data not found.',
						components: [],
					});
				}

				// record the attempt
				await this.sql`
					INSERT INTO wotd_quiz_attempt ${this.sql({
						option_id: optionId,
						user_id: interaction.user.id,
						guild_id: interaction.guildId ?? 'dm',
					})}
				`;

				track().wotdQuizAttempted(interaction.user.id, interaction.guildId, {
					word: chosenOption.word,
					correct: chosenOption.correct,
				});

				if (chosenOption.correct) {
					const container = new ContainerBuilder().setAccentColor(Colors.Green).addTextDisplayComponents(
						new TextDisplayBuilder().setContent(stripIndents`
								### Correct!
								${chosenOption.sentence}

								${chosenOption.explanation}
							`),
					);

					return void interaction.update({
						components: [container],
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
					});
				}

				// fetch the correct answer for feedback
				const [correctOption] = await this.sql<[{ explanation: string; sentence: string }]>`
					SELECT sentence, explanation FROM wotd_quiz_option
					WHERE wotd_history_id = ${chosenOption.wotd_history_id} AND correct = true
				`;

				const container = new ContainerBuilder()
					.setAccentColor(Colors.Red)
					.addTextDisplayComponents(new TextDisplayBuilder().setContent('### Not quite'))
					.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(stripIndents`
							**Your pick:** ${chosenOption.sentence}
							${chosenOption.explanation}
						`),
					)
					.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(stripIndents`
							**Correct answer:** ${correctOption.sentence}
							${correctOption.explanation}
						`),
					);

				return void interaction.update({
					components: [container],
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			} catch (error) {
				logger.error(error, 'Error handling wotd answer button');
				return void interaction.update({
					content: 'Something went wrong recording your answer.',
					components: [],
				});
			}
		}

		// `feedback:dm:reply:${submissionId}`,
		const feedbackDmReplyRes = /^feedback:dm:reply:(?<submissionId>.+)$/.exec(interaction.customId);
		if (feedbackDmReplyRes) {
			const submissionId = feedbackDmReplyRes.groups!.submissionId!;
			const row = await fetchFeedbackRow(submissionId);
			if (!row) {
				return void interaction.editReply({
					content: 'Row not found',
				});
			}

			const randomId = randomBytes(8).toString('hex');

			await interaction.showModal({
				title: 'Reply to Thoth Developers',
				custom_id: randomId,
				components: [
					createModalActionRow([
						createTextComponent({
							label: 'Content',
							placeholder: `Hello! Yes, that is what happened.`,
							style: TextInputStyle.Paragraph,
							customId: 'content',
						}),
					]),
				],
			});

			const collected = await interaction
				.awaitModalSubmit({
					filter: (collected) => collected.user.id === interaction.user.id && collected.customId === randomId,
					time: 120_000, // 2 minutes
				})
				.catch(async () => {
					try {
						await interaction.editReply({
							content: 'You took too long to respond',
							components: [],
						});
					} catch (error_) {
						const error = error_ as Error;
						logger.error(error, error.message);
					}

					return undefined;
				});

			if (!collected) return;

			const content = collected.fields.getTextInputValue('content');
			if (!content.length)
				return void collected.editReply({ content: 'Content cannot be empty', components: [] });
			try {
				const post = await ((await this.client.channels.fetch(row.channel_id!)!) as ForumChannel).threads.fetch(
					row.thread_id!,
				);

				await post?.send({
					content: `📥 ${content}`,
				});

				return void collected.editReply({
					content: 'Sent!',
				});
			} catch (error_) {
				const error = error_ as DiscordAPIError;
				logger.warn(error, 'Error while sending DM');

				return void collected.editReply({
					content: `Error while sending response to Thoth Developers: ${error.message}`,
					components: [],
				});
			}
		}
	}

	private async handleModalSubmit(interaction: ModalSubmitInteraction<'cached'>): Promise<void> {
		const lng = interaction.locale;
		await interaction.deferReply({ ephemeral: true });
		track().modalSubmitted(interaction.user.id, interaction.guildId, {
			customId: interaction.customId,
		});

		const feedbackSubmitRes = /^feedback:(?<type>bug|feature|general):submit$/.exec(interaction.customId);
		if (feedbackSubmitRes) {
			const type = feedbackSubmitRes.groups!.type!;
			const subject = interaction.fields.getTextInputValue('subject');
			const description = interaction.fields.getTextInputValue('description');

			const feedbackForumChannel = (await this.client.channels.fetch(
				process.env.FEEDBACK_FORUM_CHANNEL_ID!,
			))! as ForumChannel;

			// create table if not exists feedback_submission (
			// 	id uuid primary key default gen_random_uuid(),
			// 	type text not null default 'general',
			// 	user_id text not null,
			// 	subject text,
			// 	description text not null,
			//  channel_id text not null,
			//  thread_id text not null,
			// 	created_at timestamptz not null default now()
			// );
			const [{ id }] = await this.sql<[{ id: string }]>`
				insert into feedback_submission (type, user_id, subject, description)
				values (${type}, ${interaction.user.id}, ${subject ?? null}, ${description})
				returning id;
			`;
			track().feedbackSubmitted(interaction.user.id, interaction.guildId, {
				type: type as 'bug' | 'feature' | 'general',
			});

			const post = await feedbackForumChannel.threads.create({
				name: `${interaction.user.tag}: ${subject ?? `${type} Feedback (No Subject)`}`,
				appliedTags: feedbackForumChannel.availableTags.filter((tag) => tag.name === type).map((tag) => tag.id),
				message: {
					content: stripIndents`
						Id: ${inlineCode(id)}
						Type: ${inlineCode(type)}
						User: ${interaction.user.toString()} (${interaction.user.id})
						## ${subject ?? '(no subject)'}
						${description}
					`,
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setCustomId(`feedback:dm:${id}`)
								.setLabel('Send DM to User')
								.setStyle(ButtonStyle.Primary),
						),
					],
				},
			});

			// set channel_id and thread_id
			await this.sql`
				update feedback_submission
				set thread_id = ${post.id}, channel_id = ${post.parentId}
				where id = ${id}
			`;

			return void interaction.editReply({
				content: t('commands.feedback.received', { lng }),
				components: [],
			});
		}
	}
}

const hook = new WebhookClient({
	url: process.env.COMMAND_LOG_WEBHOOK_URL!,
});

function logInteraction(interaction: Interaction, error?: Error) {
	if (hook) {
		const metaParts = [
			interaction.inCachedGuild()
				? `${bold('Guild:')} ${inlineCode(interaction.guild.name)} (${interaction.guild.id})`
				: interaction.channel?.type === ChannelType.DM
					? bold('DM')
					: `Group DM: ${interaction.channel?.name}`,
		];

		if (interaction.channel && interaction instanceof CommandInteraction) {
			metaParts.push(
				interaction.channel.isThread()
					? `${bold('Thread:')} ${channelMention(interaction.channelId)} ${inlineCode(interaction.channel.name)} (${
							interaction.channel.id
						}) ${bold('in channel')}: ${
							interaction.channel.parent
								? `${channelMention(interaction.channel.parent.id)} ${inlineCode(interaction.channel.parent.name)} (${
										interaction.channel.parentId
									})`
								: 'unknown'
						}`
					: 'name' in interaction.channel
						? `${bold('Channel:')} ${channelMention(interaction.channelId)} ${inlineCode(interaction.channel.name!)} (${
								interaction.channel.id
							})`
						: 'Direct Message',
			);
		}

		const description = logDescription(interaction);
		const isCommandError = error instanceof CommandError;
		void hook.send({
			content: !isCommandError && error !== undefined ? `<@${process.env.OWNER_ID}>` : '',
			embeds: [
				{
					// a command error is not a failure, so we don't need to mark it as such
					color: error && !isCommandError ? Colors.DarkRed : Colors.DarkGreen,
					author: {
						icon_url: interaction.inCachedGuild()
							? interaction.member.displayAvatarURL()
							: interaction.user.displayAvatarURL(),
						name: `${interaction.user.username} (${interaction.user.id})`,
					},
					description: error
						? stripIndents`
						${description}
						Error:
						\`\`\`js
						${error}
						\`\`\`
					`
						: logDescription(interaction),
					fields: [
						{
							name: 'Metadata',
							value: metaParts.join('\n'),
						},
					],
					timestamp: new Date().toISOString(),
				},
			],
		});
	}
}

function logDescription(interaction: Interaction) {
	if (interaction.isChatInputCommand()) {
		return codeBlock(interaction.toString());
	}

	if (interaction.isUserContextMenuCommand()) {
		return codeBlock(
			`(${ApplicationCommandType[interaction.commandType]}Ctx) ${interaction.commandName} on ${interaction.targetUser.username} (${interaction.targetUser.id})`,
		);
	}

	if (interaction.isMessageContextMenuCommand()) {
		return codeBlock(
			`[${ApplicationCommandType[interaction.commandType]}Ctx] ${interaction.commandName} on ${interaction.targetMessage.id}`,
		);
	}

	return 'Unknown interaction type';
}
