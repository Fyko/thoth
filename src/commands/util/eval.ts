import process from 'node:process';
import { inspect } from 'node:util';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import type { CommandInteraction } from 'discord.js';
import type { Command } from '#structures';
import type { ArgumentsOf } from '#util/types/index.js';

const data = {
	name: 'eval',
	description: 'Evaluate JavaScript code.',
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

export default class implements Command {
	public readonly data = data;

	private _clean(text: string): any {
		const replacedText = text
			.replaceAll('`', `\`${String.fromCodePoint(8_203)}`)
			.replaceAll('@', `@${String.fromCodePoint(8_203)}`);

		return replacedText.replace(new RegExp(process.env.DISCORD_TOKEN!, 'gi'), SENSITIVE_PATTERN_REPLACEMENT);
	}

	public exec = async (interaction: CommandInteraction, args: Arguments) => {
		if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply('Unauthorized.');
		await interaction.deferReply();

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
				return await interaction.editReply(MESSAGES.COMMANDS.EVAL.ERRORS.TOO_LONG);
			}

			if (response.length > 0) {
				await interaction.editReply(response);
			}
		} catch (error) {
			return interaction.editReply(MESSAGES.COMMANDS.EVAL.ERRORS.CODE_BLOCK(this._clean(error)));
		}
	};
}
