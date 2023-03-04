import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import i18n from 'i18next';
import { fetchDataLocalizations } from '#util/index.js';

const NounCommand = {
	name: i18n.t('commands.noun.meta.name'),
	name_localizations: fetchDataLocalizations('commands.noun.meta.name'),
	description: i18n.t('commands.noun.meta.description'),
	description_localizations: fetchDataLocalizations('commands.noun.meta.description'),
	options: [
		{
			name: 'word',
			name_localizations: fetchDataLocalizations('commands.noun.meta.args.word.name'),
			description: i18n.t('commands.noun.meta.args.word.description'),
			description_localizations: fetchDataLocalizations('commands.noun.meta.args.word.description'),
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'limit',
			name_localizations: fetchDataLocalizations('common.commands.args.limit.name'),
			description: i18n.t('common.commands.args.limit.description'),
			description_localizations: fetchDataLocalizations('common.commands.args.limit.description'),
			type: ApplicationCommandOptionType.Integer,
		},
	],
} as const;

export default NounCommand;
