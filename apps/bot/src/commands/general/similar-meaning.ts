import { URLSearchParams } from 'node:url';
import SimilarMeaningCommand from '@thoth/interactions/commands/general/similar-meaning';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import { inject, injectable } from 'tsyringe';
import { BlockedUserModule, BlockedWordModule, DismissableAlertModule } from '#structures';
import { parseLimit } from '#util/args.js';
import { DatamuseQuery, fetchDatamuseRaw } from '#util/datamuse.js';
import { CommandError } from '#util/error.js';
import { firstUpperCase, trimArray } from '#util/index.js';
import { UseModeration } from '../../hooks/contentModeration.js';

@injectable()
export default class<Cmd extends typeof SimilarMeaningCommand> extends Command<Cmd> {
	public readonly data = SimilarMeaningCommand;

	public constructor(
		@inject(BlockedWordModule) public readonly blockedWord: BlockedWordModule,
		@inject(BlockedUserModule) public readonly blockedUser: BlockedUserModule,
		@inject(DismissableAlertModule) public readonly dismissableAlertService: DismissableAlertModule,
	) {
		super();
	}

	@UseModeration<Cmd>()
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<Cmd>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? false });
		const limit = parseLimit(args.limit, lng);

		const startsWith = args['starts-with'];
		const endsWith = args['ends-with'];

		if (startsWith && endsWith) throw new Error(i18n.t('common.errors.with_clause_exclusivity', { lng }));

		const search = new URLSearchParams();
		search.append(DatamuseQuery.MeansLike, args.word);

		if (startsWith) {
			search.append('sp', `${startsWith}*`);
		} else if (endsWith) {
			search.append('sp', `*${endsWith}`);
		}

		const words = await fetchDatamuseRaw(search).catch(() => null);
		if (!words?.length) throw new CommandError(i18n.t('common.errors.not_found', { lng }));
		const mapped = words.map(({ word }) => word);

		const content = startsWith
			? i18n.t('commands.similar-meaning.starts_with_success', {
					lng,
					found_count: mapped.length.toString(),
					word: firstUpperCase(args.word),
					words: trimArray(mapped, limit).join(', '),
					starts_with: startsWith,
				})
			: endsWith
				? i18n.t('commands.similar-meaning.ends_with_success', {
						lng,
						found_count: mapped.length.toString(),
						word: firstUpperCase(args.word),
						words: trimArray(mapped, limit).join(', '),
						ends_with: endsWith,
					})
				: i18n.t('commands.similar-meaning.generic_success', {
						lng,
						found_count: mapped.length.toString(),
						word: firstUpperCase(args.word),
						words: trimArray(mapped, limit).join(', '),
					});

		await interaction.editReply(content.slice(0, 2_000));
	}
}
