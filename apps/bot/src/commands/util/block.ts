import process from 'node:process';
import { inlineCode } from '@discordjs/builders';
import type BlockCommad from '@thoth/interactions/commands/util/block';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { Client } from 'discord.js';
import i18n from 'i18next';
import { type Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { kSQL } from '#util/symbols.js';
import { BlockedWordModule } from '../../structures/BlockedWord.js';

@injectable()
export default class extends Command<typeof BlockCommad> {
	public constructor(
		@inject(Client) public readonly client: Client,
		@inject(kSQL) public readonly sql: Sql<any>,
		@inject(BlockedWordModule) public readonly blockedWord: BlockedWordModule,
	) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof BlockCommad>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		if (![interaction.user?.id, interaction.member?.user.id].includes(process.env.OWNER_ID!))
			throw new Error(i18n.t('common.errors.unauthorized', { lng }));

		await this.blockedWord.add(args.word);

		const existing = this.blockedWord.words;

		await interaction.editReply({
			content: `Added ${args.word} to the blocked words list. Current blocked words (${inlineCode(
				existing.length.toLocaleString('en-US'),
			)}): ${existing.map(inlineCode).join(', ')}`,
		});
	}
}
