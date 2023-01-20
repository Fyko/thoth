import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import i18n from 'i18next';
import { fetchDataLocalizations } from '#util/index.js';

const ThatFollowCommand = {
	name: i18n.t('commands.that-follow.meta.name'),
	name_localizations: fetchDataLocalizations('commands.that-follow.meta.name'),
	description: i18n.t('commands.that-follow.meta.description'),
	description_localizations: fetchDataLocalizations('commands.that-follow.meta.description'),
	options: [
		{
			name: 'word',
			name_localizations: fetchDataLocalizations('commands.that-follow.meta.args.word.name'),
			description: i18n.t('commands.that-follow.meta.args.word.description'),
			description_localizations: fetchDataLocalizations('commands.that-follow.meta.args.word.description'),
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'starts-with',
			name_localizations: fetchDataLocalizations('common.commands.args.starts-with.name'),
			description: i18n.t('common.commands.args.starts-with.description'),
			description_localizations: fetchDataLocalizations('common.commands.args.starts-with.description'),
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'ends-with',
			name_localizations: fetchDataLocalizations('common.commands.args.ends-with.name'),
			description: i18n.t('common.commands.args.ends-with.description'),
			description_localizations: fetchDataLocalizations('common.commands.args.ends-with.description'),
			type: ApplicationCommandOptionType.String,
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

export default ThatFollowCommand;
