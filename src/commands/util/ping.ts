import type { APIInteraction } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import PingCommand from '#interactions/commands/util/ping.js';
import type { Command } from '#structures';
import { createResponse } from '#util/respond.js';

export default class implements Command {
	public readonly data = PingCommand;

	public exec = async (res: FastifyReply, _: APIInteraction, lng: string) => {
		const pongs = i18n.t('commands.ping.pongs', { lng, returnObjects: true }) as string[];

		const content = pongs[Math.floor(Math.random() * pongs.length)];
		return createResponse(res, content, true);
	};
}
