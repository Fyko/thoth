import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import i18n from 'i18next';
import { fetchDataLocalizations } from '../../index.js';

const WordOfTheDayCommand = {
	name: i18n.t('commands.word-of-the-day.meta.name'),
	name_localizations: fetchDataLocalizations('commands.word-of-the-day.meta.name'),
	description: i18n.t('commands.word-of-the-day.meta.description'),
	description_localizations: fetchDataLocalizations('commands.word-of-the-day.meta.description'),
	options: [
		{
			name: 'hide',
			name_localizations: fetchDataLocalizations('common.commands.args.hide.name'),
			description: i18n.t('common.commands.args.hide.description'),
			description_localizations: fetchDataLocalizations('common.commands.args.hide.description'),
			type: ApplicationCommandOptionType.Boolean,
		},
	],
	contexts: [0, 1, 2],
	integration_types: [0, 1],
} as const;

export default WordOfTheDayCommand;
