import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import type TriggersCommand from '#interactions/commands/general/triggers.js';
import { parseLimit } from '#util/args.js';
import { DatamuseQuery, fetchDatamuse } from '#util/datamuse.js';
import { firstUpperCase, trimArray } from '#util/index.js';

export default class extends Command<typeof TriggersCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof TriggersCommand>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });

		const limit = parseLimit(args.limit, lng);

		const words = await fetchDatamuse(DatamuseQuery.Triggers, args.word).catch(() => null);
		if (!words?.length) throw new Error(i18n.t('common.errors.not_found', { lng }));
		const mapped = words.map((h) => h.word);

		await interaction.editReply(
			i18n.t('commands.triggers.success', {
				found_count: words.length.toString(),
				word: firstUpperCase(args.word),
				words: trimArray(mapped, limit).join(', '),
				lng,
			}),
		);
	}
}
