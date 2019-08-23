import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import request from 'node-fetch';
import { trimArray, firstUpperCase } from '../../util/Util';
import { stripIndents } from 'common-tags';

export default class AdjectiveCommand extends Command {
	public constructor() {
		super('adjective', {
			category: 'general',
			aliases: ['adjective', 'adj'],
			description: {
				content: `Responds with adjectives that would descibe your query.`,
				usage: '<word>',
				examples: ['ocean', 'hospital', 'tree'],
			},
			ratelimit: 3,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'word',
					type: 'string',
					prompt: {
						start: 'What word would you like to look up?',
					},
				},
			],
		});
	}

	public async exec(msg: Message, { word }: { word: string }): Promise<Message | Message[]> {
		const body = await request(`https://api.datamuse.com/words?rel_jjb=${word}`);
		const response = await body.json();
		const words = response.map((i: any) => i.word);
		if (!words.length) return msg.util!.reply('couldn\'t find any results for your query!');
		const embed = this.client.util.embed()
			.setColor(this.client.config.color)
			.setDescription(stripIndents`
                **Found ${words.length} adjectives to descirbe \`${firstUpperCase(word)}\`**.

                ${trimArray(words, 40).join(', ')}
            `);
		return msg.util!.send({ embed });
	}
}
