import CloseRhymeCommand from '@thoth/interactions/commands/general/close-rhyme';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import { parseLimit } from '#util/args.js';
import { DatamuseQuery, fetchDatamuse } from '#util/datamuse.js';
import { CommandError } from '#util/error.js';
import { firstUpperCase, trimArray } from '#util/index.js';

export default class extends Command<typeof CloseRhymeCommand> {
	public readonly data = CloseRhymeCommand;

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof CloseRhymeCommand>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });

		const limit = parseLimit(args.limit, lng);

		const words = await fetchDatamuse(DatamuseQuery.CloseRhyme, args.word).catch(() => null);
		if (!words?.length) throw new CommandError(i18n.t('common.errors.not_found', { lng }));
		const mapped = words.map(({ word }) => word);

		await interaction.editReply(
			i18n
				.t('commands.close-rhyme.success', {
					found_count: words.length.toString(),
					word: firstUpperCase(args.word),
					words: trimArray(mapped, limit).join(', '),
					lng,
				})
				.slice(0, 2_000),
		);
	}
}
