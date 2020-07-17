import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import request from 'node-fetch';
import { firstUpperCase, trimArray } from '../../util';

export default class ThatFollowsCommand extends Command {
	public constructor() {
		super('that-follows', {
			category: 'general',
			aliases: ['that-follows', 'tf'],
			description: {
				content: `Responds with words that would normally follow your query.\nFlags: \`starts-with:\` and \`ends-with:\``,
				usage: '<word/phrase> [flag]',
				examples: ['immobile', 'smells like flowers ends-with:s', 'unable to view starts-with:b'],
			},
			ratelimit: 3,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'word',
					match: 'content',
					prompt: {
						start: "What's the word you'd like to get following-words for?",
					},
				},
				{
					id: 'starts',
					match: 'option',
					flag: 'starts-with:',
				},
				{
					id: 'ends',
					match: 'option',
					flag: 'ends-with:',
				},
			],
		});
	}

	public async exec(
		msg: Message,
		{ word, starts, ends }: { word: string; starts: string | null; ends: string | null },
	): Promise<Message | Message[]> {
		if (ends && starts) return msg.util!.reply(`you can only use one option! Command canceled.`);
		let URL = `https://api.datamuse.com/words?lc=${word}`;

		let other = '';
		if (starts !== null) {
			URL += `&sp=${starts}*`;
			other = `that start with \`${starts.toUpperCase()}\``;
		} else if (ends !== null) {
			URL += `&sp=*${ends}`;
			other = `and end with \`${ends.toUpperCase()}\``;
		}

		const body = await request(URL);
		const response = await body.json();
		const words = response.map((i: any) => i.word);

		if (!words.length) return msg.util!.reply("couldn't find any results for your query!");
		const embed = this.client.util.embed().setColor(this.client.config.color).setDescription(stripIndents`
                **Found ${words.length} words that would normally follow ${firstUpperCase(word)} ${other}**.

                ${trimArray(words, 40).join(', ')}
            `);
		return msg.util!.send({ embed });
	}
}
