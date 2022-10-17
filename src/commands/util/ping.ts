import type { FastifyReply } from 'fastify';
import type { Command } from '#structures';
import { pingResponses } from '#util/constants.js';
import { createResponse } from '#util/respond.js';

const data = {
	name: 'ping',
	description: 'Ensures the bot is responding to commands.',
} as const;

export default class implements Command {
	public readonly data = data;

	public exec = async (res: FastifyReply) => {
		const content = pingResponses[Math.floor(Math.random() * pingResponses.length)];
		return createResponse(res, content, true);
	};
}
