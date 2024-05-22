import i18n from 'i18next';
import { fetchDataLocalizations } from '../../index.js';

const FeedbackCommand = {
	name: i18n.t('commands.feedback.meta.name'),
	name_localizations: fetchDataLocalizations('commands.feedback.meta.name'),
	description: i18n.t('commands.feedback.meta.description'),
	description_localizations: fetchDataLocalizations('commands.feedback.meta.description'),
	contexts: [0, 1, 2],
	integration_types: [0, 1],
} as const;

export default FeedbackCommand;
