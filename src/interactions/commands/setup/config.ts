import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import i18n from 'i18next';
import { fetchDataLocalizations } from '#util/index.js';

const ConfigCommand = {
	name: i18n.t('commands.setup.meta.name'),
	name_localizations: fetchDataLocalizations('commands.setup.meta.name'),
	description: i18n.t('commands.setup.meta.description'),
	description_localizations: fetchDataLocalizations('commands.setup.meta.description'),
	options: [
		{
			name: 'wotd',
			name_localizations: fetchDataLocalizations('commands.setup.wotd.meta.name'),
			description: i18n.t('commands.setup.wotd.meta.description'),
			description_localizations: fetchDataLocalizations('commands.setup.wotd.meta.description'),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'channel',
					name_localizations: fetchDataLocalizations('commands.setup.wotd.meta.args.channel.name'),
					description: i18n.t('commands.setup.wotd.meta.args.channel.description'),
					description_localizations: fetchDataLocalizations('commands.setup.wotd.meta.args.channel.description'),
					type: ApplicationCommandOptionType.Channel,
					required: true,
				},
			],
		},
	],
} as const;

export default ConfigCommand;
