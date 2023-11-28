import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import i18n from 'i18next';
import { fetchDataLocalizations } from '../../index.js';

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
		{
			name: 'hide',
			name_localizations: fetchDataLocalizations('common.commands.args.hide.name'),
			description: i18n.t('common.commands.args.hide.description'),
			description_localizations: fetchDataLocalizations('common.commands.args.hide.description'),
			type: ApplicationCommandOptionType.Boolean,
		},
	],
} as const;

export default EvalCommand;
