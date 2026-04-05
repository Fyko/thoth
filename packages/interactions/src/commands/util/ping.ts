import i18n from 'i18next';
import { fetchDataLocalizations } from '../../index.js';

const PingCommand = {
	name: i18n.t('commands.ping.meta.name'),
	name_localizations: fetchDataLocalizations('commands.ping.meta.name'),
	description: i18n.t('commands.ping.meta.description'),
	description_localizations: fetchDataLocalizations('commands.ping.meta.description'),
	contexts: [0, 1, 2],
	integration_types: [0, 1],
} as const;

export default PingCommand;
