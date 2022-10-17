import type { APIInteraction } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';

export type Command = {
	readonly data: Record<string, unknown> & { name: string };

	exec(res: FastifyReply, interaction: APIInteraction, locale: string): Promise<unknown> | unknown;
};
