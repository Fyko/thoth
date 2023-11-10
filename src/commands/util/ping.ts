import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import type PingCommand from '#interactions/commands/util/ping.js';

export default class extends Command<typeof PingCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		_args: ArgsParam<typeof PingCommand>,
		lng: LocaleParam,
	): Promise<void> {
		const pongs = i18n.t('commands.ping.pongs', { lng, returnObjects: true }) as string[];

		const content = pongs[Math.floor(Math.random() * pongs.length)]!;

		await interaction.reply({
			content,
			ephemeral: true,
		});
	}
}
