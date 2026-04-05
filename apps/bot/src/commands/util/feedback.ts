import type FeedbackCommand from '@thoth/interactions/commands/util/feedback';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { ButtonStyle } from 'discord-api-types/v10';
import { ActionRowBuilder, ButtonBuilder, Client } from 'discord.js';
import { t } from 'i18next';
import { type Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { BlockedUserModule, BlockedWordModule } from '#structures';
import { kSQL } from '#util/symbols.js';

@injectable()
export default class<Cmd extends typeof FeedbackCommand> extends Command<Cmd> {
	public constructor(
		@inject(Client) public readonly client: Client,
		@inject(kSQL) public readonly sql: Sql<any>,
		@inject(BlockedUserModule) public readonly blockedUser: BlockedUserModule,
		@inject(BlockedWordModule) public readonly blockedWord: BlockedWordModule,
	) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		_args: ArgsParam<Cmd>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.reply({
			content: 'What type of feedback would you like to provide?',
			ephemeral: true,
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId('feedback:bug')
						.setLabel(t('commands.feedback.meta.args.category.choices.bug', { lng }))
						.setStyle(ButtonStyle.Danger),
					new ButtonBuilder()
						.setCustomId('feedback:feature')
						.setLabel(t('commands.feedback.meta.args.category.choices.feature', { lng }))
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId('feedback:general')
						.setLabel(t('commands.feedback.meta.args.category.choices.general', { lng }))
						.setStyle(ButtonStyle.Secondary),
				),
			],
		});
	}
}
