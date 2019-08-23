import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
	public constructor() {
		super('prefix', {
			category: 'utilities',
			aliases: ['prefix'],
			description: {
				content: 'Lists all available prefixes.',
			},
		});
	}

	public async exec(msg: Message): Promise<Message | Message[]> {
		return msg.util!.send(`The current prefixes are ${(this.handler.prefix as string[]).map(p => `\`${p}\``).join(' **|** ')}`);
	}
}
