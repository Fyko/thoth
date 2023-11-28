import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import i18n from 'i18next';
import { fetchDataLocalizations } from '../../index.js';

const CloseRhymeCommand = {
	name: i18n.t('commands.close-rhyme.meta.name'),
	name_localizations: fetchDataLocalizations('commands.close-rhyme.meta.name'),
	description: i18n.t('commands.close-rhyme.meta.description'),
	description_localizations: fetchDataLocalizations('commands.close-rhyme.meta.description'),
	options: [
		{
			name: 'word',
			name_localizations: fetchDataLocalizations('commands.close-rhyme.meta.args.word.name'),
			description: i18n.t('commands.close-rhyme.meta.args.word.description'),
			description_localizations: fetchDataLocalizations('commands.close-rhyme.meta.args.word.description'),
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
		{
			name: 'hide',
			name_localizations: fetchDataLocalizations('common.commands.args.hide.name'),
			description: i18n.t('common.commands.args.hide.description'),
			description_localizations: fetchDataLocalizations('common.commands.args.hide.description'),
			type: ApplicationCommandOptionType.Boolean,
		},
	],
} as const;

export default CloseRhymeCommand;
