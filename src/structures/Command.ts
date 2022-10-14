import type { CommandInteraction } from 'discord.js';

export type Command = {
	readonly data: Record<string, unknown> & { name: string };

	exec(interaction: CommandInteraction, args: unknown): Promise<unknown> | unknown;
}
