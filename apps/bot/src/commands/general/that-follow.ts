import { URLSearchParams } from 'node:url';
import type ThatFollowCommand from '@thoth/interactions/commands/general/that-follow';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import { inject, injectable } from 'tsyringe';
import { BlockedWordModule } from '#structures';
import { parseLimit } from '#util/args.js';
import { DatamuseQuery, fetchDatamuseRaw } from '#util/datamuse.js';
import { CommandError } from '#util/error.js';
import { firstUpperCase, pickRandom, trimArray } from '#util/index.js';

@injectable()
export default class extends Command<typeof ThatFollowCommand> {
	public constructor(@inject(BlockedWordModule) public readonly blockedWord: BlockedWordModule) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ThatFollowCommand>,
		lng: LocaleParam,
	): Promise<void> {
		if (this.blockedWord.check(args.word)) {
			throw new CommandError(
				pickRandom(i18n.t('common.errors.blocked_word', { lng, returnObjects: true }) as string[]),
			);
		}

		await interaction.deferReply({ ephemeral: args.hide ?? true });
		const limit = parseLimit(args.limit, lng);

		const startsWith = args['starts-with'];
		const endsWith = args['ends-with'];

		if (startsWith && endsWith) throw new Error(i18n.t('common.errors.with_clause_exclusivity', { lng }));

		const search = new URLSearchParams();
		search.append(DatamuseQuery.ThatFollows, args.word);

		if (startsWith) {
			search.append('sp', `${startsWith}*`);
		} else if (endsWith) {
			search.append('sp', `*${endsWith}`);
		}

		const words = await fetchDatamuseRaw(search).catch(() => null);
		if (!words?.length) throw new CommandError(i18n.t('common.errors.not_found', { lng }));
		const mapped = words.map(({ word }) => word);

		const content = startsWith
			? i18n.t('commands.that-follow.starts_with_success', {
					lng,
					found_count: mapped.length.toString(),
					word: firstUpperCase(args.word),
					words: trimArray(mapped, limit).join(', '),
					starts_with: startsWith,
			  })
			: endsWith
			  ? i18n.t('commands.that-follow.ends_with_success', {
						lng,
						found_count: mapped.length.toString(),
						word: firstUpperCase(args.word),
						words: trimArray(mapped, limit).join(', '),
						ends_with: endsWith,
			    })
			  : i18n.t('commands.that-follow.generic_success', {
						lng,
						found_count: mapped.length.toString(),
						word: firstUpperCase(args.word),
						words: trimArray(mapped, limit).join(', '),
			    });

		await interaction.editReply(content.slice(0, 2_000));
	}
}
