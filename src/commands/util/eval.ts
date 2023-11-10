import process from 'node:process';
import { inspect } from 'node:util';
import { Command } from '@yuudachi/framework';
import type { ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { Client } from 'discord.js';
import i18n from 'i18next';
import { inject, injectable } from 'tsyringe';
import type EvalCommand from '#interactions/commands/util/eval.js';

export const SENSITIVE_PATTERN_REPLACEMENT = '[REDACTED]';

const MESSAGES = {
	COMMANDS: {
		EVAL: {
			INPUT: (code: string): string => `Input:\`\`\`js\n${code}\n\`\`\``,
			OUTPUT: (code: string): string => `Output:\`\`\`js\n${code}\n\`\`\``,
			TYPE: ``,
			TIME: ``,
			HASTEBIN: ``,
			ERRORS: {
				TOO_LONG: `Output too long, failed to upload to hastebin as well.`,
				CODE_BLOCK: (err: Error): string => `Error:\`\`\`xl\n${err}\n\`\`\``,
			},
		},
	},
};

@injectable()
export default class extends Command<typeof EvalCommand> {
	public constructor(@inject(Client) public readonly client: Client) {
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
		args: ArgsParam<typeof EvalCommand>,
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

			await interaction.editReply(MESSAGES.COMMANDS.EVAL.ERRORS.CODE_BLOCK(this._clean(err.toString())));
		}
	}
}
