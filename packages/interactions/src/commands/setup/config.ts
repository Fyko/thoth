import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import i18n from 'i18next';
import { fetchDataLocalizations } from '../../index.js';

const ConfigCommand = {
	name: i18n.t('commands.config.meta.name'),
	name_localizations: fetchDataLocalizations('commands.config.meta.name'),
	description: i18n.t('commands.config.meta.description'),
	description_localizations: fetchDataLocalizations('commands.config.meta.description'),
	options: [
		{
			name: 'wotd',
			name_localizations: fetchDataLocalizations('commands.config.wotd.meta.name'),
			description: i18n.t('commands.config.wotd.meta.description'),
			description_localizations: fetchDataLocalizations('commands.config.wotd.meta.description'),
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'channel',
					name_localizations: fetchDataLocalizations('commands.config.wotd.meta.args.channel.name'),
					description: i18n.t('commands.config.wotd.meta.args.channel.description'),
					description_localizations: fetchDataLocalizations(
						'commands.config.wotd.meta.args.channel.description',
					),
					type: ApplicationCommandOptionType.Channel,
					required: true,
				},
			],
		},
	],
	contexts: [0],
	integration_types: [0],
} as const;

export default ConfigCommand;
