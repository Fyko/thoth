import { ActionRowBuilder, ButtonBuilder, hideLinkEmbed, hyperlink, inlineCode, quote, underscore } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import type { APIApplicationCommandInteractionData, APIInteraction } from 'discord-api-types/v10';
import { ApplicationCommandOptionType, ButtonStyle } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import type { Entry, Sense, Senses, VerbalIllustration } from 'mw-collegiate';
import { inject, injectable } from 'tsyringe';
import { fetchDefinition } from '#mw';
import { formatText } from '#mw/format.js';
import type { Command } from '#structures';
import { RedisManager } from '#structures';
import { Characters, Emojis } from '#util/constants.js';
import { fetchDataLocalizations, kRedis, trimArray } from '#util/index.js';
import { createResponse } from '#util/respond.js';
import type { ArgumentsOf } from '#util/types/index.js';

const data = {
	name: i18n.t('commands.definition.meta.name'),
	name_localizations: fetchDataLocalizations('commands.definition.meta.name'),
	description: i18n.t('commands.definition.meta.description'),
	description_localizations: fetchDataLocalizations('commands.definition.meta.description'),
	options: [
		{
			name: 'word',
			name_localizations: fetchDataLocalizations('commands.definition.meta.args.word.name'),
			description: i18n.t('commands.definition.meta.args.word.description'),
			description_localizations: fetchDataLocalizations('commands.definition.meta.args.word.description'),
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'short',
			name_localizations: fetchDataLocalizations('commands.definition.meta.args.short.name'),
			description: i18n.t('commands.definition.meta.args.short.description'),
			description_localizations: fetchDataLocalizations('commands.definition.meta.args.short.description'),
			type: ApplicationCommandOptionType.Boolean,
		},
	],
} as const;

type Arguments = ArgumentsOf<typeof data>;

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: RedisManager) {}

	public readonly data = data;

	public interaction = async (res: FastifyReply, _: APIInteraction, { word }: Record<string, string>, lng: string) => {
		return this.run(res, { word, short: false }, lng);
	}

	public exec = async (res: FastifyReply, interaction: APIInteraction, lng: string) => {
		const { data } = interaction as { data: APIApplicationCommandInteractionData };
		const { word, short } = Object.fromEntries(
			// @ts-expect-error pain
			data.options.map(({ name, value }: { name: string; value: any }) => [name, value]),
		) as Arguments;
		
		return this.run(res, { word, short }, lng);
	};

	private run = async (res: FastifyReply, { word, short }: { word: string; short?: boolean; }, lng: string) => {
		const defRes = await fetchDefinition(this.redis, word);
		if (typeof defRes[0] === 'string') {
			if (typeof defRes !== 'object') {
				return createResponse(res, i18n.t('common.errors.not_found', { lng }), true);
			}

			const suggestions = defRes.slice(0, 5) as string[];

			const component = new ActionRowBuilder().addComponents(
				suggestions.map(sugg => new ButtonBuilder().setCustomId(`definition:${sugg}`).setLabel(sugg).setStyle(ButtonStyle.Secondary)),
			);

			return createResponse(res, i18n.t('common.errors.not_found_w_suggestions', { lng }), true, {
				components: [component.toJSON()],
			});
		}

		const { hwi, def, meta, fl } = defRes[0] as Entry;

		// const attachment = createPronunciationURL(hwi.prs?.[0].sound?.audio);

		const url = `https://www.merriam-webster.com/dictionary/${word}`;
		const pronunciation = hwi.prs?.[0].mw ? `(${hwi.prs[0].mw})` : '';

		const senses = def![0].sseq
			.flat(1)
			.filter(([type]: Senses) => type === 'sense')
			.map(([, data]: Sense) => data);

		const defs = senses
			.map(({ dt }) => {
				const def = dt.find(([type]) => type === 'text');
				if (!def) return false;

				const [, text] = def;
				const vis = dt.find(([type]) => type === 'vis') as ['vis', VerbalIllustration];

				if (vis) {
					const [, [{ t, aq }]] = vis;
					if (aq) {
						return `${text}\n${quote(`"${t}" -${aq.auth}`)}`;
					}

					return `${text}\n${quote(`"${t}"`)}`;
				}

				return text;
			})
			.filter(Boolean)
			.map(formatText);

		if (short) {
			return createResponse(
				res,
				stripIndents`
					${Emojis.MerriamWebster} ${hyperlink(inlineCode(meta.id), hideLinkEmbed(url))} (${fl}) ${
					Characters.Bullet
				} (${hwi.hw.replaceAll('*', Characters.Bullet)}) ${Characters.Bullet} ${pronunciation}
					${defs[0]}
				`,
				false,
			);
		}

		return createResponse(
			res,
			stripIndents`
				${Emojis.MerriamWebster} ${hyperlink(inlineCode(meta.id), hideLinkEmbed(url))} (${fl}) ${
				Characters.Bullet
			} (${hwi.hw.replaceAll('*', Characters.Bullet)}) ${Characters.Bullet} ${pronunciation}
				${Characters.Bullet} Stems: ${trimArray(meta.stems.map(inlineCode), 15).join(', ')}

				${underscore(i18n.t('common.titles.definitions', { lng }))}
				${defs.join('\n')}
			`,
			false,
		);
	}
}
