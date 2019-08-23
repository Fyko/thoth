import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import request from 'node-fetch';
import { trimArray, firstUpperCase } from '../../util/Util';
import { stripIndents } from 'common-tags';

export default class SimilarSpellingCommand extends Command {
	public constructor() {
		super('similar-spelling', {
			category: 'general',
			aliases: ['similar-spelling', 'ss'],
			description: {
				content: `Responds with words that have a similar spelling to your query.`,
				usage: '<word>',
				examples: ['orng', 'streat', 'banana'],
			},
			ratelimit: 3,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'word',
					match: 'content',
					prompt: {
						start: 'What word would you like to get similarly spelled words for?.',
					},
				},
			],
		});
	}

	public async exec(msg: Message, { word }: { word: string }): Promise<Message | Message[]> {
		const body = await request(`https://api.datamuse.com/words?sp=${word}`);
		const response = await body.json();
		const words = response.map((i: any) => i.word);

		if (!words.length) return msg.util!.reply('couldn\'t find any results for your query!');
		const embed = this.client.util.embed()
			.setColor(this.client.config.color)
			.setDescription(stripIndents`
                **Found ${words.length} words with similar spelling to ${firstUpperCase(word)}**.

                ${trimArray(words, 40).join(', ')}
            `);
		return msg.util!.send({ embed });
	}
}
