import { Command, Argument, Category } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export interface Emojis {
	[key: string]: string;
}

const EMOJIS: Emojis = {
	general: '`📖',
	utilities: '🛠',
};

export default class HelpCommand extends Command {
	public constructor() {
		super('help', {
			category: 'utilities',
			aliases: ['help'],
			description: {
				content: 'Displays all available commands or detailed info for a specific command.',
				usage: '[command]',
				examples: ['', 'ebay', 'size'],
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'arg',
					type: Argument.union('commandAlias', (_: Message, str: string): null | Category<string, Command> => {
						if (!str) return null;
						const c = this.handler.categories.get(str.toLowerCase());
						if (c) return c;
						return null;
					}),
					prompt: {
						start: 'Which category or command would you like more info on?',
						retry: 'Please provide a valid categiry or command.',
						optional: true,
					},
				},
			],
		});
	}

	public async exec(msg: Message, { arg }: { arg: undefined | Command | Category<string, Command> }): Promise<Message | Message[]> {
		const prefix = (this.handler.prefix as string[])[0];
		if (!arg) {
			const embed = this.client.util.embed()
				.setColor(this.client.config.color!)
				.setTitle('📝 Commands')
				.setDescription(stripIndents`
					This is a list of the available categories and commands.
                    For more info on category or command, type \`${prefix}help <category/command>\`
                `);

			for (const category of this.handler.categories.values()) {
				this.client.logger.verbose(`Category ID: ${category.id}`);
				if (category.id === 'owner' && !this.client.ownerID.includes(msg.author!.id)) continue;
				const commands = category.filter(c => c.aliases.length > 0)
					.map(cmd => `\`${cmd.aliases[0]}\``)
					.join(', ');
				embed.addField(`\`📖\` ${category.id.replace(/(\b\w)/gi, lc => lc.toUpperCase())}`, commands);
			}

			return msg.util!.send({ embed });
		}
		if (arg instanceof Command) {
			const embed = this.client.util.embed()
				.setColor(this.client.config.color!)
				.setTitle(`\`${arg.aliases[0]} ${arg.description.usage ? arg.description.usage : ''}\``)
				.addField('\`📖\` Description', arg.description.content || '\u200b');

			if (arg.aliases.length > 1) embed.addField('\`📖\` Aliases', `\`${arg.aliases.join('`, `')}\``);
			if (arg.description.examples && arg.description.examples.length) embed.addField('\`📖\` Examples', `\`${arg.aliases[0]} ${arg.description.examples.join(`\`\n\`${arg.aliases[0]} `)}\``);

			return msg.util!.send({ embed });
		}

		const name = arg.id.replace(/(\b\w)/gi, lc => lc.toUpperCase());
		const embed = this.client.util.embed()
			.setColor(this.client.config.color!)
			.setTitle(`\\${EMOJIS[arg.id]} ${name}`)
			.setDescription(stripIndents`
				This is a list of all commands within the \`${name}\` category.
				For more info on a command, type \`${prefix}help <command>\`
			`);
		const commands = arg.array().filter(c => c.aliases.length > 0)
			.map(cmd => `\`${cmd.aliases[0]}\`${cmd.description && cmd.description.content ? ` - ${cmd.description.content.split('\n')[0].substring(0, 120)}` : ''}`)
			.join('\n');
		embed.addField('Commands', commands);
		return msg.util!.send({ embed });
	}
}
