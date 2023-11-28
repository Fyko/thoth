import type WordOfTheDayCommand from '@thoth/interactions/commands/general/word-of-the-day';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import type { Entry } from 'mw-collegiate';
import { inject, injectable } from 'tsyringe';
import { fetchDefinition } from '#mw';
import { createWOTDContent, fetchWordOfTheDay } from '#mw/wotd.js';
import { RedisManager } from '#structures';
import { kRedis } from '#util/index.js';

@injectable()
export default class extends Command<typeof WordOfTheDayCommand> {
	public constructor(@inject(kRedis) public readonly redis: RedisManager) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof WordOfTheDayCommand>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });
		const word = await fetchWordOfTheDay(this.redis);

		const [defRes] = await fetchDefinition(this.redis, word);
		if (defRes instanceof String) {
			throw new TypeError(i18n.t('common.errors.not_found', { lng }));
		}

		const content = createWOTDContent(defRes as Entry, lng);

		await interaction.editReply(content);
	}
}
