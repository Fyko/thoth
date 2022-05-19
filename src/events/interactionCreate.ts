import { logger } from '#logger';
import type { Command, Listener } from '#structures';
import { kCommands } from '#util/symbols';
import { transformArguments } from '#util/types';
import { Client, Collection, CommandInteraction, Constants, Interaction, SelectMenuInteraction } from 'discord.js';
import { inject, injectable } from 'tsyringe';

@injectable()
export default class implements Listener {
	public readonly event = Constants.Events.INTERACTION_CREATE;

	public constructor(
		public readonly client: Client<true>,
		@inject(kCommands) public readonly commands: Collection<string, Command>,
	) {}

	public exec = (): void => {
		this.client.on(this.event, (interaction: Interaction) => {
			if (interaction.isCommand()) void this.handleCommand(interaction);
			if (interaction.isSelectMenu()) void this.handleSelectMenu(interaction);
		});
	};

	private readonly handleCommand = async (interaction: CommandInteraction): Promise<void> => {
		const name = interaction.commandName;
		const command = this.commands.get(name);
		if (command) {
			const user = interaction.user;
			const info = `command "${name}"; triggered by ${user.username}#${user.discriminator} (${user.id})`;
			logger.info(`Executing ${info}`);
			logger.info(interaction.options.data);

			try {
				await command.exec(interaction, transformArguments(interaction.options.data));
				logger.info(`Successfully executed ${info}`);
			} catch (err) {
				logger.error({ msg: `Failed to execute ${info}`, err });
			}
		}
	};

	private readonly handleSelectMenu = (interaction: SelectMenuInteraction) => console.dir(interaction);
}
