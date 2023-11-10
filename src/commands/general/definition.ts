import { hideLinkEmbed, hyperlink, inlineCode, quote, underscore } from '@discordjs/builders';
import { Command, createButton, createMessageActionRow } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { stripIndents } from 'common-tags';
import { ButtonStyle } from 'discord-api-types/v10';
import { AttachmentBuilder, ComponentType } from 'discord.js';
import i18n from 'i18next';
import type { Entry, Sense, Senses, VerbalIllustration } from 'mw-collegiate';
import { inject, injectable } from 'tsyringe';
import type DefinitionCommand from '#interactions/commands/general/definition.js';
import { logger } from '#logger';
import { createPronunciationURL, fetchDefinition } from '#mw';
import { formatText } from '#mw/format.js';
import { RedisManager } from '#structures';
import { Characters, Emojis } from '#util/constants.js';
import { kRedis, trimArray } from '#util/index.js';

@injectable()
export default class extends Command<typeof DefinitionCommand> {
	public constructor(@inject(kRedis) public readonly redis: RedisManager) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof DefinitionCommand>,
		lng: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: args.hide ?? true });

		let word = args.word;
		let defRes = await fetchDefinition(this.redis, args.word);
		let definition: Entry | undefined;
		while (!definition) {
			// will be string[] if no defs were found and the api provided suggestions
			// will be Entry[] if defs were found
			if (!defRes.length) throw new Error(i18n.t('common.errors.not_found', { lng }));
			if (typeof defRes !== 'object') {
				throw new TypeError(i18n.t('common.errors.not_found', { lng }));
			}

			if (typeof defRes[0] === 'object') {
				definition = defRes[0] as Entry;
				break;
			}

			if (typeof defRes[0] === 'string') {
				const suggestions = defRes.slice(0, 5) as string[];

				const buttons = [...suggestions.entries()].map(([index, sugg]) =>
					createButton({
						customId: `definition:${sugg}`,
						label: sugg,
						style: index === 0 ? ButtonStyle.Primary : ButtonStyle.Secondary,
					}),
				);

				await interaction.editReply({
					content: i18n.t('common.errors.not_found_w_suggestions', { lng }),
					components: [createMessageActionRow(buttons)],
				});

				const collected = await reply
					.awaitMessageComponent({
						filter: (collected) => collected.user.id === interaction.user.id,
						componentType: ComponentType.Button,
						time: 15_000,
					})
					.catch(async () => {
						try {
							await interaction.editReply({
								content: i18n.t('common.errors.definition_suggestion_timed_out', { lng }),
								components: [],
							});
						} catch (error_) {
							const error = error_ as Error;
							logger.error(error, error.message);
						}

						return undefined;
					});
				if (!collected) return;

				word = collected.customId.split(':')[1]!;
				defRes = await fetchDefinition(this.redis, word);
			}
		}

		const { hwi, def, meta, fl } = definition;

		const soundUrl = hwi.prs?.[0]!.sound ? createPronunciationURL(hwi.prs?.[0]!.sound!.audio) : undefined;

		const url = `https://www.merriam-webster.com/dictionary/${encodeURIComponent(word)}`;
		const pronunciation = hwi.prs?.[0]?.mw
			? soundUrl
				? `([${hwi.prs[0].mw}](${soundUrl}))`
				: `(${hwi.prs[0].mw})`
			: '';

		const senses = def![0]!.sseq
			.flat(1)
			// @ts-expect-error pain
			.filter(([type]: Senses) => type === 'sense')
			// @ts-expect-error pain
			.map(([, data]: Sense) => data);

		const defs = senses
			.map(({ dt }) => {
				const def = dt.find(([type]) => type === 'text');
				if (!def) return false;

				const [, text] = def;
				const vis = dt.find(([type]) => type === 'vis') as ['vis', VerbalIllustration];

				if (vis) {
					const [, [vi]] = vis;
					if (vi?.aq) {
						return `${text}\n${quote(`"${vi.t}" -${vi.aq.auth}`)}`;
					}

					return `${text}\n${quote(`"${vi!.t}"`)}`;
				}

				return text as string;
			})
			.filter((t) => typeof t === 'string')
			.map((t) => formatText(t as string));

		if (args.short) {
			return void interaction.editReply(
				stripIndents`
					${Emojis.MerriamWebster} ${hyperlink(inlineCode(meta.id), hideLinkEmbed(url))} (${fl}) ${
						Characters.Bullet
					} (${hwi.hw.replaceAll('*', Characters.Bullet)}) ${Characters.Bullet} ${pronunciation}
					${defs[0]}
				`,
			);
		}

		const soundAttachment = soundUrl
			? new AttachmentBuilder(soundUrl, {
					description: `The pronunciation of the word ${meta.id}`,
					name: `${meta.id}.mp3`,
			  })
			: undefined;

		await interaction.editReply({
			content: stripIndents`
				${Emojis.MerriamWebster} ${hyperlink(inlineCode(meta.id), hideLinkEmbed(url))} (${fl}) ${
					Characters.Bullet
				} (${hwi.hw.replaceAll('*', Characters.Bullet)}) ${Characters.Bullet} ${pronunciation}
				${Characters.Bullet} Stems: ${trimArray(meta.stems.map(inlineCode), 15).join(', ')}

				${underscore(i18n.t('common.titles.definitions', { lng }))}
				${defs.join('\n')}
			`,
			files: soundAttachment ? [soundAttachment] : [],
		});
	}
}
