import i18n from 'i18next';
import { fetchDataLocalizations } from '#util/index.js';

const WordOfTheDayCommand = {
	name: i18n.t('commands.word-of-the-day.meta.name'),
	name_localizations: fetchDataLocalizations('commands.word-of-the-day.meta.name'),
	description: i18n.t('commands.word-of-the-day.meta.description'),
	description_localizations: fetchDataLocalizations('commands.word-of-the-day.meta.description'),
} as const;

export default WordOfTheDayCommand;
