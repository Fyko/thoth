import type PingCommand from '@thoth/interactions/commands/util/ping';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';

export default class<Cmd extends typeof PingCommand> extends Command<Cmd> {
	public override async chatInput(
		interaction: InteractionParam,
		_args: ArgsParam<Cmd>,
		lng: LocaleParam,
	): Promise<void> {
		const pongs = i18n.t('commands.ping.pongs', {
			lng,
			returnObjects: true,
		}) as string[];

		const content = pongs[Math.floor(Math.random() * pongs.length)]!;

		await interaction.reply({
			content,
			ephemeral: true,
		});
	}
}
