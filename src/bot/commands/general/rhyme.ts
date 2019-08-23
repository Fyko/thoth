import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import request from 'node-fetch';
import { trimArray, firstUpperCase } from '../../util/Util';
import { stripIndents } from 'common-tags';

export default class RhymeCommand extends Command {
	public constructor() {
		super('rhyme', {
			category: 'general',
			aliases: ['rhyme', 'rhymes', 'rh'],
			description: {
				content: `Responds with words that rhyme with your query.`,
				usage: '<word>',
				examples: ['orange', 'young'],
			},
			ratelimit: 3,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'word',
					match: 'content',
					prompt: {
						start: 'What word would you like to get rhyming words for?',
					},
				},
			],
		});
	}

	public async exec(msg: Message, { word }: { word: string }): Promise<Message | Message[]> {
		const body = await request(`https://api.datamuse.com/words?rel_rhy=${word}`);
		const response = await body.json();
		const words = response.map((i: any) => i.word);

		if (!words.length) return msg.util!.reply('couldn\'t find any results for your query!');
		const embed = this.client.util.embed()
			.setColor(this.client.config.color)
			.setDescription(stripIndents`
                **Found ${words.length} words that rhyme with ${firstUpperCase(word)}**.

                ${trimArray(words, 40).join(', ')}
            `);
		return msg.util!.send({ embed });
	}
}
