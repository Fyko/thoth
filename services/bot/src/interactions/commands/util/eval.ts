import { ApplicationCommandOptionType } from 'discord-api-types/v10';

const EvalCommand = {
	name: 'eval',
	description: 'Evaluate JavaScript code.',
	dev: true,
	options: [
		{
			name: 'code',
			description: 'The code to execute',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
} as const;

export default EvalCommand;
