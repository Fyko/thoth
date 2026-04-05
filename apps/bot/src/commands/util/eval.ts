import process from 'node:process';
import { inspect } from 'node:util';
import type EvalCommand from '@thoth/interactions/commands/util/eval';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { stripIndents } from 'common-tags';
import { Client } from 'discord.js';
import i18n from 'i18next';
import { type Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { BlockedUserModule, BlockedWordModule } from '#structures';
import { kSQL } from '#util/symbols.js';

export const SENSITIVE_PATTERN_REPLACEMENT = '[REDACTED]';

const MESSAGES = {
	COMMANDS: {
		EVAL: {
			INPUT: (code: string): string => stripIndents`
				Input:
				\`\`\`js
				${code}
				\`\`\`
			`,
			OUTPUT: (code: string): string => stripIndents`
				Output:
				\`\`\`js
				${code}
				\`\`\`
			`,
			TYPE: ``,
			TIME: ``,
			HASTEBIN: ``,
			ERRORS: {
				TOO_LONG: `Output too long, failed to upload to hastebin as well.`,
				CODE_BLOCK: (err: Error): string => stripIndents`
					Error:
					\`\`\`xl
					${err}
					\`\`\`
				`,
			},
		},
	},
};

@injectable()
export default class<Cmd extends typeof EvalCommand> extends Command<Cmd> {
	public constructor(
		@inject(Client) public readonly client: Client,
		@inject(kSQL) public readonly sql: Sql<any>,
		@inject(BlockedUserModule) public readonly blockedUser: BlockedUserModule,
		@inject(BlockedWordModule) public readonly blockedWord: BlockedWordModule,
	) {
		super();
	}

	private _clean(text: string): any {
		const replacedText = text
			.replaceAll('`', `\`${String.fromCodePoint(8_203)}`)
			.replaceAll('@', `@${String.fromCodePoint(8_203)}`);

		return replacedText.replaceAll(new RegExp(process.env.DISCORD_TOKEN!, 'gi'), SENSITIVE_PATTERN_REPLACEMENT);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<Cmd>,
		lng: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		if (![interaction.user?.id, interaction.member?.user.id].includes(process.env.OWNER_ID!))
			throw new Error(i18n.t('common.errors.unauthorized', { lng }));

		let evaled: any;
		try {
			const hrStart = process.hrtime();
			evaled = eval(args.code); // eslint-disable-line no-eval

			// eslint-disable-next-line no-eq-null, eqeqeq
			if (evaled != null && typeof evaled.then === 'function') evaled = await evaled;
			const hrStop = process.hrtime(hrStart);

			let response = '';
			response += MESSAGES.COMMANDS.EVAL.INPUT(args.code);
			response += MESSAGES.COMMANDS.EVAL.OUTPUT(this._clean(inspect(evaled, { depth: 0 })));
			response += `• Type: \`${typeof evaled}\``;
			response += ` • time taken: \`${(hrStop[0] * 1e9 + hrStop[1]) / 1e6}ms\``;

			if (response.length > 2_000) {
				return void interaction.editReply(MESSAGES.COMMANDS.EVAL.ERRORS.TOO_LONG);
			}

			if (response.length > 0) {
				await interaction.editReply(response);
			}
		} catch (error: unknown) {
			const err = error as Error;

			await interaction.editReply(
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				MESSAGES.COMMANDS.EVAL.ERRORS.CODE_BLOCK(this._clean((err.stack ?? err).toString())),
			);
		}
	}
}
