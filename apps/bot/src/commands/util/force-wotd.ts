import type ForceWotdCommand from '@thoth/interactions/commands/util/force-wotd';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { Client } from 'discord.js';
import { type Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { BlockedUserModule, BlockedWordModule } from '#structures';
import { kSQL } from '#util/symbols.js';
import i18n from 'i18next';
import process from 'node:process';
import { triggerWOTD } from '../../jobs.js';

@injectable()
export default class<Cmd extends typeof ForceWotdCommand> extends Command<Cmd> {
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
		await interaction.deferReply({ ephemeral: true });

		if (![interaction.user?.id, interaction.member?.user.id].includes(process.env.OWNER_ID!))
			throw new Error(i18n.t('common.errors.unauthorized', { lng }));

		await triggerWOTD(true);

		await interaction.editReply({ content: 'WOTD triggered' });
	}
}
