import type { APIInteraction } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import type { Command } from '#structures';
import { fetchDataLocalizations } from '#util/index.js';
import { createResponse } from '#util/respond.js';

const data = {
	name: i18n.t('commands.ping.meta.name'),
	name_localizations: fetchDataLocalizations('commands.ping.meta.name'),
	description: i18n.t('commands.ping.meta.description'),
	description_localizations: fetchDataLocalizations('commands.ping.meta.description'),
} as const;

export default class implements Command {
	public readonly data = data;

	public exec = async (res: FastifyReply, _: APIInteraction, lng: string) => {
		const pongs = i18n.t('commands.ping.pongs', { lng, returnObjects: true }) as string[];

		const content = pongs[Math.floor(Math.random() * pongs.length)];
		return createResponse(res, content, true);
	};
}
