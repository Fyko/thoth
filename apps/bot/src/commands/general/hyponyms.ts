import type HyponymsCommand from '@thoth/interactions/commands/general/hyponyms';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import { inject, injectable } from 'tsyringe';
import { BlockedWordModule } from '#structures';
import { parseLimit } from '#util/args.js';
import { DatamuseQuery, fetchDatamuse } from '#util/datamuse.js';
import { CommandError } from '#util/error.js';
import { firstUpperCase, pickRandom, trimArray } from '#util/index.js';

@injectable()
export default class extends Command<typeof HyponymsCommand> {
	public constructor(@inject(BlockedWordModule) public readonly blockedWord: BlockedWordModule) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof HyponymsCommand>,
		lng: LocaleParam,
	): Promise<void> {
		if (this.blockedWord.check(args.word)) {
			throw new CommandError(
				pickRandom(i18n.t('common.errors.blocked_word', { lng, returnObjects: true }) as string[]),
			);
		}

		await interaction.deferReply({ ephemeral: args.hide ?? true });

		const limit = parseLimit(args.limit, lng);

		const words = await fetchDatamuse(DatamuseQuery.Hyponym, args.word).catch(() => null);
		if (!words?.length) throw new CommandError(i18n.t('common.errors.not_found', { lng }));
		const mapped = words.map(({ word }) => word);

		await interaction.editReply(
			i18n.t('commands.hyponyms.success', {
				found_count: words.length.toString(),
				word: firstUpperCase(args.word),
				words: trimArray(mapped, limit).join(', '),
				lng,
			}),
		);
	}
}
