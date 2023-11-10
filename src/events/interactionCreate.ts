import type { Command } from '@yuudachi/framework';
import { transformApplicationInteraction, kCommands } from '@yuudachi/framework';
import type { Event } from '@yuudachi/framework/types';
import { ApplicationCommandType, Client, Events } from 'discord.js';
import { Counter } from 'prom-client';
import { inject, injectable } from 'tsyringe';
import { logger } from '#logger';

const commandsMetrics = new Counter({
	name: 'thoth_commands',
	help: 'Number of commands executed',
	labelNames: ['command', 'success'],
});

@injectable()
export default class implements Event {
	public name = 'Interaction handling';

	public event = Events.InteractionCreate as const;

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
