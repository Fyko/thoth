import { ApplicationCommandOptionType, type RESTPatchAPIApplicationCommandJSONBody } from 'discord-api-types/v10';

const BlockCommand = {
	name: 'block',
	description: 'Blocks users or words from Thoth.',
	dev: true,
	options: [
		{
			name: 'word',
			description: 'Blocks this word as a search parameter.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'word',
					description: 'The word to block',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
		{
			name: 'user',
			description: 'Blocks this user from using Thoth.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user to block',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'reason',
					description: 'The reason for the block',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
	],
} as const satisfies RESTPatchAPIApplicationCommandJSONBody & { dev: boolean };

export default BlockCommand;
