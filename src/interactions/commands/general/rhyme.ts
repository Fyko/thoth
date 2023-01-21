import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import i18n from 'i18next';
import { fetchDataLocalizations } from '#util/index.js';

const RhymeCommand = {
	name: i18n.t('commands.rhyme.meta.name'),
	name_localizations: fetchDataLocalizations('commands.rhyme.meta.name'),
	description: i18n.t('commands.rhyme.meta.description'),
	description_localizations: fetchDataLocalizations('commands.rhyme.meta.description'),
	options: [
		{
			name: 'word',
			name_localizations: fetchDataLocalizations('commands.rhyme.meta.args.word.name'),
			description: i18n.t('commands.rhyme.meta.args.word.description'),
			description_localizations: fetchDataLocalizations('commands.rhyme.meta.args.word.description'),
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

export default RhymeCommand;