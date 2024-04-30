import type HolonymsCommand from '@thoth/interactions/commands/general/holonyms';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import { inject, injectable } from 'tsyringe';
import { BlockedUserModule, BlockedWordModule, ShowByDefaultAlerterModule } from '#structures';
import { parseLimit } from '#util/args.js';
import { DatamuseQuery, fetchDatamuse } from '#util/datamuse.js';
import { CommandError } from '#util/error.js';
import { firstUpperCase, pickRandom, trimArray } from '#util/index.js';

@injectable()
export default class<Cmd extends typeof HolonymsCommand> extends Command<Cmd> {
	public constructor(
		@inject(BlockedWordModule) public readonly blockedWord: BlockedWordModule,
		@inject(BlockedUserModule) public readonly blockedUser: BlockedUserModule,
		@inject(ShowByDefaultAlerterModule) public readonly showByDefaultAlerter: ShowByDefaultAlerterModule,
	) {
		super();
	}

	private async moderation(interaction: InteractionParam, args: ArgsParam<Cmd>, lng: LocaleParam): Promise<void> {
		if (this.blockedWord.check(args.word)) {
			throw new CommandError(
				pickRandom(i18n.t('common.errors.blocked_word', { lng, returnObjects: true }) as string[]),
			);
		}

		const ban = this.blockedUser.check(interaction.user.id);
		if (ban) {
			throw new CommandError(i18n.t('common.errors.banned', { lng, reason: ban }));
		}
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<Cmd>,
		lng: LocaleParam,
	): Promise<void> {
		await this.moderation(interaction, args, lng);

		await interaction.deferReply({ ephemeral: args.hide ?? false });

		const limit = parseLimit(args.limit, lng);

		const words = await fetchDatamuse(DatamuseQuery.Holonym, args.word).catch(() => null);
		if (!words?.length) throw new CommandError(i18n.t('common.errors.not_found', { lng }));
		const mapped = words.map(({ word }) => word);

		await interaction.editReply(
			i18n.t('commands.holonyms.success', {
				found_count: words.length.toString(),
				word: firstUpperCase(args.word),
				words: trimArray(mapped, limit).join(', '),
				lng,
			}),
		);

		if (!(await this.showByDefaultAlerter.beenAlerted(interaction.user.id))) {
			await this.showByDefaultAlerter.add(interaction.user.id);
			await interaction.followUp({
				content:
					'As of <t:1714509120:D>, various Thoth commands will no longer hide their response. To hide the response from other users as previous, set the `hide` option to `True`.',
				ephemeral: true,
			});
		}
	}
}
