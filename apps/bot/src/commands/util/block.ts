import process from 'node:process';
import { inlineCode } from '@discordjs/builders';
import type BlockCommad from '@thoth/interactions/commands/util/block';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { Client } from 'discord.js';
import i18n from 'i18next';
import { type Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { BlockedWordModule, BlockedUserModule } from '#structures';
import { kSQL } from '#util/symbols.js';

@injectable()
export default class<Cmd extends typeof BlockCommad> extends Command<Cmd> {
	public constructor(
		@inject(Client) public readonly client: Client,
		@inject(kSQL) public readonly sql: Sql<any>,
		@inject(BlockedWordModule) public readonly blockedWord: BlockedWordModule,
		@inject(BlockedUserModule) public readonly blockedUser: BlockedUserModule,
	) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<Cmd>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });
		const key = Object.keys(args)[0];

		switch (key) {
			case 'word':
				await this.word(interaction, args.word, lng);
				break;
			case 'user':
				await this.user(interaction, args.user, lng);
				break;
			default:
		}
	}

	private async user(
		interaction: InteractionParam,
		{ user, reason }: ArgsParam<typeof BlockCommad>['user'],
		lng: LocaleParam,
	): Promise<void> {
		if (![interaction.user?.id, interaction.member?.user.id].includes(process.env.OWNER_ID!))
			throw new Error(i18n.t('common.errors.unauthorized', { lng }));

		await this.blockedUser.add(user.user.id, reason);

		await interaction.editReply({
			content: `Blocked user <@${user.user.id}> (${inlineCode(user.user.id)}) with reason ${inlineCode(reason)}`,
		});
	}

	private async word(
		interaction: InteractionParam,
		args: ArgsParam<typeof BlockCommad>['word'],
		lng: LocaleParam,
	): Promise<void> {
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
