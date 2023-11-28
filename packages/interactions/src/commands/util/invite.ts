import i18n from 'i18next';
import { fetchDataLocalizations } from '../../index.js';

const InviteCommand = {
	name: i18n.t('commands.invite.meta.name'),
	name_localizations: fetchDataLocalizations('commands.invite.meta.name'),
	description: i18n.t('commands.invite.meta.description'),
	description_localizations: fetchDataLocalizations('commands.invite.meta.description'),
} as const;

export default InviteCommand;
