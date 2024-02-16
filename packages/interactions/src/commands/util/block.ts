import { ApplicationCommandOptionType, type RESTPatchAPIApplicationCommandJSONBody } from 'discord-api-types/v10';

const BlockCommand = {
	name: 'block',
	description: 'Blocks users from using this word as a search parameter.',
	dev: true,
	options: [
		{
			name: 'word',
			description: 'The word to block',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
} as const satisfies RESTPatchAPIApplicationCommandJSONBody & { dev: boolean };

export default BlockCommand;
