import type { APIInteraction } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import type { Entry } from 'mw-collegiate';
import { inject, injectable } from 'tsyringe';
import WordOfTheDayCommand from '#interactions/commands/general/word-of-the-day.js';
import { fetchDefinition } from '#mw';
import { createWOTDContent, fetchWordOfTheDay } from '#mw/wotd.js';
import type { Command } from '#structures';
import { RedisManager } from '#structures';
import { kRedis } from '#util/index.js';
import { createResponse } from '#util/respond.js';

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: RedisManager) {}

	public readonly data = WordOfTheDayCommand;

	public exec = async (res: FastifyReply, _: APIInteraction, lng: string) => {
		const word = await fetchWordOfTheDay(this.redis);

		const [defRes] = await fetchDefinition(this.redis, word);
		if (defRes instanceof String) {
			return createResponse(res, i18n.t('common.errors.not_found', { lng }), true);
		}

		const content = createWOTDContent(defRes as Entry, lng);

		return createResponse(res, content, false);
	};
}
