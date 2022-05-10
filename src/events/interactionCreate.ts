import { logger } from '#logger';
import type { Command, Listener } from '#structures';
import { kCommands } from '#util/symbols';
import { transformArguments } from '#util/types';
import { Client, Collection, CommandInteraction, Constants, Interaction } from 'discord.js';
import { on } from 'events';
import { inject, injectable } from 'tsyringe';

@injectable()
export default class implements Listener {
	public readonly event = Constants.Events.INTERACTION_CREATE;

	public constructor(
		public readonly client: Client<true>,
		@inject(kCommands) public readonly commands: Collection<string, Command>,
	) {}

	public exec = async (): Promise<void> => {
		for await (const [interaction] of on(this.client, this.event) as AsyncIterableIterator<[Interaction]>) {
			if (interaction.isCommand()) void this.handleCommand(interaction);

			continue;
		}
	};

	private readonly handleCommand = async (interaction: CommandInteraction): Promise<void> => {
		const name = interaction.commandName;
		const command = this.commands.get(name);
		if (command) {
			const user = interaction.user;
			const info = `command "${name}"; triggered by ${user.username}#${user.discriminator} (${user.id})`;
			logger.info(`Executing ${info}`);
			logger.debug(interaction.options);

			try {
				await command.exec(interaction, transformArguments(interaction.options.data));
				logger.info(`Successfully executed ${info}`);
			} catch (err) {
				logger.error({ msg: `Failed to execute ${info}`, err });
			}
		}
	};
}
