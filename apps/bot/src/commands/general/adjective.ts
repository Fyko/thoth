import type AdjectiveCommand from '@thoth/interactions/commands/general/adjective';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import { inject, injectable } from 'tsyringe';
import { BlockedUserModule, BlockedWordModule, DismissableAlertModule } from '#structures';
import { parseLimit } from '#util/args.js';
import { DatamuseQuery, fetchDatamuse } from '#util/datamuse.js';
import { CommandError } from '#util/error.js';
import { firstUpperCase, trimArray } from '#util/index.js';
import { UseModeration } from '../../hooks/contentModeration.js';
import { UseFeedbackAlert } from '../../hooks/dismissableAlert.js';

@injectable()
export default class<Cmd extends typeof AdjectiveCommand> extends Command<Cmd> {
	public constructor(
		@inject(BlockedWordModule) public readonly blockedWord: BlockedWordModule,
		@inject(BlockedUserModule) public readonly blockedUser: BlockedUserModule,
		@inject(DismissableAlertModule) public readonly dismissableAlertService: DismissableAlertModule,
	) {
		super();
	}

	@UseModeration<Cmd>()
	@UseFeedbackAlert()
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<Cmd>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? false });

		const limit = parseLimit(args.limit, lng);

		const words = await fetchDatamuse(DatamuseQuery.Adjective, args.word).catch(() => null);
		if (!words?.length) throw new CommandError(i18n.t('common.errors.not_found', { lng }));
		const mapped = words.map(({ word }) => word);

		await interaction.editReply(
			i18n.t('commands.adjective.success', {
				found_count: words.length.toString(),
				word: firstUpperCase(args.word),
				words: trimArray(mapped, limit).join(', '),
				lng,
			}),
		);
	}
}
