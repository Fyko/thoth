import process from 'node:process';
import type { Command } from '@yuudachi/framework';
import { transformApplicationInteraction, kCommands } from '@yuudachi/framework';
import type { Event } from '@yuudachi/framework/types';
import { stripIndents } from 'common-tags';
import { ApplicationCommandType, Client, Events, WebhookClient } from 'discord.js';
import { Counter, Registry } from 'prom-client';
import { container, inject, injectable } from 'tsyringe';
import { logger } from '#logger';

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

	public webhook = new WebhookClient({ url: process.env.COMMAND_LOG_WEBHOOK_URL! });

	public constructor(
		public readonly client: Client<true>,
		@inject(kCommands) public readonly commands: Map<string, Command>,
	) {}

	public execute(): void {
		this.client.on(this.event, async (interaction) => {
			// only accept regular slash commands
			if (!interaction.isCommand()) {
				return;
			}

			if (!interaction.inCachedGuild()) return;

			const command = this.commands.get(interaction.commandName.toLowerCase());

			if (command) {
				try {
					const args_ = interaction.options.data.map(
						// @ts-expect-error i know it works
						({ name, value }: { name: string; value: any }) => `\`${name}\`: \`${value}\``,
					);

					void this.webhook.send({
						content: stripIndents`
							Command \`${interaction.commandName}\` (\`${interaction.commandId}\`) executed by ${interaction.user.tag} (\`${
								interaction.user.id
							}\`)
							
							Arguments: ${args_.join('; ')}
						`,
					});

					if (interaction.commandType === ApplicationCommandType.ChatInput) {
						logger.info(
							{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
							`Executing chatInput command ${interaction.commandName}`,
						);

						await command.chatInput(
							interaction,
							transformApplicationInteraction(interaction.options.data),
							interaction.locale,
						);

						commandsMetrics.inc({
							success: 'true',
							command: interaction.commandName,
						});
					}
				} catch (error) {
					const err = error as Error;
					logger.error(err, err.message);

					commandsMetrics.inc({
						success: 'false',
						command: interaction.commandName,
					});

					try {
						if (!interaction.deferred && !interaction.replied) {
							logger.warn(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								'Command interaction has not been deferred before throwing',
							);
							await interaction.deferReply({ ephemeral: true });
						}

						await interaction.editReply({ content: err.message, components: [] });
					} catch (error) {
						const sub = error as Error;
						logger.error(sub, sub.message);
					}
				}
			}
		});
	}
}
