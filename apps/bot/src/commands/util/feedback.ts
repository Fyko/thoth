import type FeedbackCommand from '@thoth/interactions/commands/util/feedback';
import { Command, createButton, createMessageActionRow } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { ButtonStyle, Client } from 'discord.js';
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
				createMessageActionRow([
					createButton({
						label: t('commands.feedback.meta.args.category.choices.bug', { lng }),
						style: ButtonStyle.Danger,
						customId: 'feedback:bug',
					}),
					createButton({
						label: t('commands.feedback.meta.args.category.choices.feature', { lng }),
						style: ButtonStyle.Success,
						customId: 'feedback:feature',
					}),
					createButton({
						label: t('commands.feedback.meta.args.category.choices.general', { lng }),
						style: ButtonStyle.Secondary,
						customId: 'feedback:general',
					}),
				]),
			],
		});
	}
}
