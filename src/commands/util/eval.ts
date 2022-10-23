import process from 'node:process';
import { inspect } from 'node:util';
import type { APIApplicationCommandInteractionData, APIInteraction } from 'discord-api-types/v10';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import i18n from 'i18next';
import type { Command, REST } from '#structures';
import { sendFollowup, defer, createResponse } from '#util/respond.js';
import type { ArgumentsOf } from '#util/types/index.js';
import { inject, injectable } from 'tsyringe';
import { kREST } from '#util/symbols.js';

const data = {
	name: 'eval',
	description: 'Evaluate JavaScript code.',
	dev: true,
	options: [
		{
			name: 'code',
			description: 'The code to execute',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
} as const;

type Arguments = ArgumentsOf<typeof data>;

export const SENSITIVE_PATTERN_REPLACEMENT = '[REDACTED]';

const MESSAGES = {
	COMMANDS: {
		EVAL: {
			LONG_OUTPUT: (link: string): string => `Output too long, uploading it to hastebin instead: ${link}.`,
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
export default class implements Command {
	public constructor(@inject(kREST) public readonly rest: REST) {}

	public readonly data = data;

	private _clean(text: string): any {
		const replacedText = text
			.replaceAll('`', `\`${String.fromCodePoint(8_203)}`)
			.replaceAll('@', `@${String.fromCodePoint(8_203)}`);

		return replacedText.replace(new RegExp(process.env.DISCORD_TOKEN!, 'gi'), SENSITIVE_PATTERN_REPLACEMENT);
	}

	public exec = async (res: FastifyReply, interaction: APIInteraction, lng: string) => {
		const { data } = interaction as { data: APIApplicationCommandInteractionData };
		const args = Object.fromEntries(
			// @ts-expect-error pain
			data.options.map(({ name, value }: { name: string; value: any }) => [name, value]),
		) as Arguments;

		if (![interaction.user?.id, interaction.member?.user.id].includes(process.env.OWNER_ID!))
			return createResponse(res, i18n.t('common.errors.unauthorized', { lng }), true);
		await defer(res);

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
				return await sendFollowup(
					process.env.DISCORD_CLIENT_ID!,
					interaction.token,
					MESSAGES.COMMANDS.EVAL.ERRORS.TOO_LONG,
				);
			}

			if (response.length > 0) {
				return await sendFollowup(process.env.DISCORD_CLIENT_ID!, interaction.token, response);
			}
		} catch (error) {
			return await sendFollowup(
				process.env.DISCORD_CLIENT_ID!,
				interaction.token,
				MESSAGES.COMMANDS.EVAL.ERRORS.CODE_BLOCK(this._clean(error)),
			);
		}
	};
}
