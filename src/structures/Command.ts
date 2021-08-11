import type { CommandInteraction } from 'discord.js';

export interface Command {
	readonly data: { name: string } & Record<string, unknown>;

	exec(interaction: CommandInteraction, args: unknown): unknown | Promise<unknown>;
}
