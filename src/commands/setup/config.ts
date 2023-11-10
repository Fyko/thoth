import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { injectable } from 'tsyringe';
import ConfigCommand from '#interactions/commands/setup/config.js';
import { wotd } from './sub/wotd.js';

@injectable()
export default class extends Command<typeof ConfigCommand> {
	public readonly data = ConfigCommand;

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ConfigCommand>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		switch (Object.keys(args)[0]) {
			case 'wotd':
				await wotd(interaction, args.wotd, lng);
				break;
			default:
		}
	}
}
