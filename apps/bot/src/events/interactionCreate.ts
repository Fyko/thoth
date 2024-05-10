import process from 'node:process';
import type { Command } from '@yuudachi/framework';
import { transformApplicationInteraction, kCommands } from '@yuudachi/framework';
import type { Event } from '@yuudachi/framework/types';
import { stripIndents } from 'common-tags';
import type { AutocompleteInteraction, ChatInputCommandInteraction, Interaction } from 'discord.js';
import {
	ApplicationCommandType,
	bold,
	channelMention,
	ChannelType,
	Client,
	codeBlock,
	Colors,
	CommandInteraction,
	Events,
	inlineCode,
	WebhookClient,
} from 'discord.js';
import { Counter, Registry } from 'prom-client';
import { container, inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import { RedisManager } from '#structures';
import { CommandError } from '#util/error.js';
import { kRedis } from '#util/symbols.js';
import { definitionAutoComplete } from '../autocomplete/definition.js';

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
		@inject(kCommands) public readonly commands: Map<string, Command>,
		@inject(kRedis) public readonly redis: RedisManager,
	) {}

	public execute(): void {
		this.client.on(this.event, async (interaction) => {
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
							} catch {}

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
					else logger.error(err, err.message);

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
						logger.error(sub, sub.message);
					}
				}
			}
		});
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
