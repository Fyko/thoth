import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import request from 'node-superfetch';
import { stripIndents } from 'common-tags';

const { WORDNIK_KEY } = process.env;

export default class DefineCommand extends Command {
	public constructor() {
		super('define', {
			category: 'general',
			aliases: ['define', 'definition'],
			description: {
				content: 'Responds with the definition of your query.',
				usage: '<word>',
				examples: ['amiable', 'candor'],
			},
			ratelimit: 3,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'word',
					prompt: {
						start: 'What word would you like the definiton of?',
					},
					type: 'rest',
				},
			],
		});
	}

	public async exec(msg: Message, { word }: { word: string }): Promise<Message | Message[]> {
		word = encodeURIComponent(word);
		const url = `http://api.wordnik.com/v4/word.json/${word}/definitions`;
		try {
			const { body } = await request
				.get(url)
				.query({
					limit: '1',
					includeRelated: 'false',
					useCanonical: 'true',
					api_key: WORDNIK_KEY!,
				});
			// @ts-ignore
			if (!body.length) return msg.util!.reply('couldn\'t find any results for your query!');
			// @ts-ignore
			const data = body[0];
			const embed = this.client.util.embed()
				.setColor('#FF6713')
				.setAuthor(data.word, 'https://www.wordnik.com/img/wordnik_heart_48.png')
				.setDescription(stripIndents`
                    (${data.partOfSpeech || '???'}) - ${data.text}
                `)
				.setFooter('Powered by Wordnik');
			return msg.util!.send(embed);
		} catch (err) {
			return msg.reply(`Oh crap. An error occured: \`${err.message}\`. Try again later.`);
		}
	}
}
