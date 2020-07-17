import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import request from 'node-fetch';
import { firstUpperCase, trimArray } from '../../util';

export default class MissingLettersCommand extends Command {
	public constructor() {
		super('missing-letters', {
			category: 'general',
			aliases: ['missing-letters', 'missing-letter', 'ml'],
			description: {
				content: `Responds with possible words that match your query.`,
				usage: '<word>',
				examples: ['a??le', 't?c?', 'ba?an?'],
			},
			ratelimit: 3,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'word',
					match: 'content',
					prompt: {
						start: 'What word would you like to match for missing letters? Ex: `a??le`.',
					},
				},
			],
		});
	}

	public async exec(msg: Message, { word }: { word: string }): Promise<Message | Message[]> {
		const body = await request(`https://api.datamuse.com/words?sp=${word}`);
		const response = await body.json();
		const words = response.map((i: any) => i.word);

		if (!words.length) return msg.util!.reply("couldn't find any results for your query!");
		const embed = this.client.util.embed().setColor(this.client.config.color).setDescription(stripIndents`
                **Found ${words.length} possible words that may be ${firstUpperCase(word)}**.

                ${trimArray(words, 40).join(', ')}
            `);
		return msg.util!.send({ embed });
	}
}
