import type { CommandInteraction, Interaction, SelectMenuInteraction } from 'discord.js';
import { Client, Collection, Events } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import type { Command, Listener} from '#structures';
import { Metrics, MetricsHandler } from '#structures';
import { kCommands, kMetrics } from '#util/symbols';
import { transformArguments } from '#util/types';

@injectable()
export default class implements Listener {
	public readonly event = Events.InteractionCreate;

	public constructor(
		public readonly client: Client<true>,
		@inject(kCommands) public readonly commands: Collection<string, Command>,
	) {}

	public exec = (): void => {
		this.client.on(this.event, (interaction: Interaction) => {
			if (interaction.isCommand()) void this.handleCommand(interaction);
			if (interaction.isSelectMenu()) this.handleSelectMenu(interaction);
		});
	};

	private readonly handleCommand = async (interaction: CommandInteraction): Promise<void> => {
		const name = interaction.commandName;
		const command = this.commands.get(name);
		if (command) {
			const user = interaction.user;
			const info = `command "${name}"; triggered by ${user.username}#${user.discriminator} (${user.id})`;
			logger.info(`Executing ${info}`);
			const args = transformArguments(interaction.options.data);

			try {
				await command.exec(interaction, args);
				logger.info(`Successfully executed ${info}`);
			} catch (error) {
				logger.error({ msg: `Failed to execute ${info}`, err: error });
			}
		}
	};

	private readonly handleSelectMenu = (interaction: SelectMenuInteraction) => console.dir(interaction);
}
