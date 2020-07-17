import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import request from 'node-fetch';
import { firstUpperCase, trimArray } from '../../util';

export default class NounCommand extends Command {
	public constructor() {
		super('noun', {
			category: 'general',
			aliases: ['noun', 'nouns', 'n'],
			description: {
				content: `Responds with nouns that would match your query.`,
				usage: '<word>',
				examples: ['dirty', 'extravagant'],
			},
			ratelimit: 3,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'word',
					match: 'content',
					prompt: {
						start: 'What word would you like to search nouns for?',
					},
				},
			],
		});
	}

	public async exec(msg: Message, { word }: { word: string }): Promise<Message | Message[]> {
		const body = await request(`https://api.datamuse.com/words?rel_jja=${word}`);
		const response = await body.json();
		const words = response.map((i: any) => i.word);

		if (!words.length) return msg.util!.reply("couldn't find any results for your query!");
		const embed = this.client.util.embed().setColor(this.client.config.color).setDescription(stripIndents`
                **Found ${words.length} nouns to describe ${firstUpperCase(word)}**.

                ${trimArray(words, 40).join(', ')}
            `);
		return msg.util!.send({ embed });
	}
}
