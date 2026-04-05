import i18n from 'i18next';
import { fetchDataLocalizations } from '../../index.js';

const InviteCommand = {
	name: i18n.t('commands.invite.meta.name'),
	name_localizations: fetchDataLocalizations('commands.invite.meta.name'),
	description: i18n.t('commands.invite.meta.description'),
	description_localizations: fetchDataLocalizations('commands.invite.meta.description'),
	contexts: [0, 1, 2],
	integration_types: [0, 1],
} as const;

export default InviteCommand;
