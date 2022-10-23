import type { APIInteraction } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';

export type Command = {
	readonly data: Record<string, unknown> & { dev?: boolean; name: string };

	interaction?: (res: FastifyReply, interaction: APIInteraction, args: Record<string, string>, lng: string) => Promise<unknown>;

	exec(res: FastifyReply, interaction: APIInteraction, locale: string): Promise<unknown> | unknown;
};
