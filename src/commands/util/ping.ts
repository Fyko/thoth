import type { CommandInteraction } from 'discord.js';
import type { Command } from '#structures';
import { pingResponses } from '#util/constants';

const data = {
	name: 'ping',
	description: 'Ensures the bot is responding to commands.',
} as const;

export default class implements Command {
	public readonly data = data;

	public exec = (interaction: CommandInteraction): Promise<void> => {
		const content = pingResponses[Math.floor(Math.random() * pingResponses.length)];
		return interaction.reply({ content, ephemeral: true });
	};
}
