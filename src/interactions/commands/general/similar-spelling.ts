import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import i18n from 'i18next';
import { fetchDataLocalizations } from '#util/index.js';

const SimilarSpellingCommand = {
	name: i18n.t('commands.similar-spelling.meta.name'),
	name_localizations: fetchDataLocalizations('commands.similar-spelling.meta.name'),
	description: i18n.t('commands.similar-spelling.meta.description'),
	description_localizations: fetchDataLocalizations('commands.similar-spelling.meta.description'),
	options: [
		{
			name: 'word',
			name_localizations: fetchDataLocalizations('commands.similar-spelling.meta.args.word.name'),
			description: i18n.t('commands.similar-spelling.meta.args.word.description'),
			description_localizations: fetchDataLocalizations('commands.similar-spelling.meta.args.word.description'),
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

export default SimilarSpellingCommand;
