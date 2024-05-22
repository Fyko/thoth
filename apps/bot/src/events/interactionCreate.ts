import { randomBytes } from 'node:crypto';
import process from 'node:process';
import type { Command } from '@yuudachi/framework';
import {
	transformApplicationInteraction,
	kCommands,
	createModalActionRow,
	createTextComponent,
	createButton,
	createMessageActionRow,
} from '@yuudachi/framework';
import type { Event } from '@yuudachi/framework/types';
import { stripIndents } from 'common-tags';
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
	ApplicationCommandType,
	bold,
	ButtonStyle,
	channelMention,
	ChannelType,
	Client,
	codeBlock,
	Colors,
	CommandInteraction,
	Events,
	inlineCode,
	TextInputStyle,
	WebhookClient,
} from 'discord.js';
import { t } from 'i18next';
import type { Sql } from 'postgres';
import { Counter, Registry } from 'prom-client';
import { container, inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import { RedisManager } from '#structures';
import { CommandError } from '#util/error.js';
import { kRedis, kSQL } from '#util/symbols.js';
import { definitionAutoComplete } from '../autocomplete/definition.js';
import { fetchFeedbackRow } from '../functions/feedback.js';

const registry = container.resolve<Registry<'text/plain; version=0.0.4; charset=utf-8'>>(Registry);
const commandsMetrics = new Counter({
	name: 'thoth_commands',
	help: 'Number of commands executed',
	labelNames: ['command', 'success'],
	registers: [registry],
});

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

						commandsMetrics.inc({
							success: 'true',
							command: interaction.commandName,
						});
					}
				} catch (error) {
					const isCommandError = error instanceof CommandError;
					const err = error as Error;

					if (isCommandError) logger.warn(err, err.message);
					else logger.error(err, 'Error while executing command');

					logInteraction(interaction, err);

					commandsMetrics.inc({
						success: 'false',
						command: interaction.commandName,
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
						Your feedback submission titled "${row.subject ?? 'No Subject'}" received a message!
						
						${content}
						- ${interaction.user.globalName ?? interaction.user.tag}
					`,
					components: [
						createMessageActionRow([
							createButton({
								label: 'Reply',
								style: ButtonStyle.Secondary,
								customId: `feedback:dm:reply:${submissionId}`,
							}),
						]),
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
						createMessageActionRow([
							createButton({
								label: 'Send DM to User',
								style: ButtonStyle.Primary,
								customId: `feedback:dm:${id}`,
							}),
						]),
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
						? `${bold('Channel:')} ${channelMention(interaction.channelId)} ${inlineCode(interaction.channel.name)} (${
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
