import { URLSearchParams } from 'node:url';
import type ThatFollowCommand from '@thoth/interactions/commands/general/that-follow';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import { inject, injectable } from 'tsyringe';
import { BlockedUserModule, BlockedWordModule, ShowByDefaultAlerterModule } from '#structures';
import { parseLimit } from '#util/args.js';
import { DatamuseQuery, fetchDatamuseRaw } from '#util/datamuse.js';
import { CommandError } from '#util/error.js';
import { firstUpperCase, pickRandom, trimArray } from '#util/index.js';

@injectable()
export default class<Cmd extends typeof ThatFollowCommand> extends Command<Cmd> {
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

		if (!(await this.showByDefaultAlerter.beenAlerted(interaction.user.id))) {
			await this.showByDefaultAlerter.add(interaction.user.id);
			await interaction.followUp({
				content:
					'As of <t:1714509120:D>, various Thoth commands will no longer automatically hide their response. Set the `hide` option to `True` to hide command responses from other users.',
				ephemeral: true,
			});
		}
	}
}
