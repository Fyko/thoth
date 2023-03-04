import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import i18n from 'i18next';
import { fetchDataLocalizations } from '#util/index.js';

const DefinitionCommand = {
	name: i18n.t('commands.definition.meta.name'),
	name_localizations: fetchDataLocalizations('commands.definition.meta.name'),
	description: i18n.t('commands.definition.meta.description'),
	description_localizations: fetchDataLocalizations('commands.definition.meta.description'),
	options: [
		{
			name: 'word',
			name_localizations: fetchDataLocalizations('commands.definition.meta.args.word.name'),
			description: i18n.t('commands.definition.meta.args.word.description'),
			description_localizations: fetchDataLocalizations('commands.definition.meta.args.word.description'),
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'short',
			name_localizations: fetchDataLocalizations('commands.definition.meta.args.short.name'),
			description: i18n.t('commands.definition.meta.args.short.description'),
			description_localizations: fetchDataLocalizations('commands.definition.meta.args.short.description'),
			type: ApplicationCommandOptionType.Boolean,
		},
	],
} as const;

export default DefinitionCommand;
