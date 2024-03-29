import ConfigCommand from '@thoth/interactions/commands/setup/config';
import { Command, logger } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { injectable } from 'tsyringe';
import { wotd } from './sub/wotd.js';

@injectable()
export default class<Cmd extends typeof ConfigCommand> extends Command<Cmd> {
	public readonly data = ConfigCommand;

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<Cmd>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });
		const key = Object.keys(args)[0];
		logger.debug(key);

		switch (key) {
			case 'wotd':
				await wotd(interaction, args.wotd, lng);
				break;
			default:
		}
	}
}
