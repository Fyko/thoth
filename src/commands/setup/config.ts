import type {
	APIApplicationCommandSubcommandOption,
	APIChatInputApplicationCommandGuildInteraction,
} from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import { injectable } from 'tsyringe';
import { wotd } from './sub/wotd.js';
import ConfigCommand from '#interactions/commands/setup/config.js';
import type { Command } from '#structures';
import { createResponse } from '#util/respond.js';

@injectable()
export default class implements Command {
	public readonly data = ConfigCommand;

	public exec = async (res: FastifyReply, interaction: APIChatInputApplicationCommandGuildInteraction, lng: string) => {
		console.dir(interaction, { depth: null });
		const { data } = interaction;

		const sub = data.options![0] as APIApplicationCommandSubcommandOption;
		console.dir(sub);

		if (sub.name === 'wotd') {
			const args = Object.fromEntries(
				// @ts-expect-error i dont wanna fish through dapi-types to find the right one
				sub.options!.map(({ name, value }: { name: string; value: any }) => [name, value]),
			);

			return wotd(res, interaction, args as { channel: string }, lng);
		}

		return createResponse(res, i18n.t('common.errors.not_found', { lng }), true);
	};
}
