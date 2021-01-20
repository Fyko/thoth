import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import fetch from 'node-fetch';
const { WORDNIK_KEY } = process.env;

export interface IWordOfTheDayResponse {
	_id: string;
	word: string;
	contentProvider: IContentProvider;
	definitions: IDefinition[];
	publishDate: Date;
	examples: IExample[];
	pdd: Date;
	note: string;
	htmlExtra: null;
}

export interface IContentProvider {
	name: string;
	id: number;
}

export interface IDefinition {
	source: string;
	text: string;
	note: null;
	partOfSpeech: string;
}

export interface IExample {
	url: string;
	title: string;
	text: string;
	id: number;
}

export default class WordOfTheDayCommand extends Command {
	public constructor() {
		super('word-of-the-day', {
			category: 'general',
			aliases: ['word-of-the-day', 'wotd'],
			description: {
				content: "Fetches today's word of the day.",
			},
			ratelimit: 3,
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	public async exec(msg: Message): Promise<Message | Message[]> {
		try {
			const url = new URL('http://api.wordnik.com/v4/words.json/wordOfTheDay');
			url.searchParams.append('api_key', WORDNIK_KEY!);

			const res = await fetch(url);
			const body: IWordOfTheDayResponse = await res.json();

			const embed = this.client.util
				.embed()
				.setColor('#FF6713')
				.setAuthor(body.word, 'https://www.wordnik.com/img/wordnik_heart_48.png')
				.setDescription(
					stripIndents`
				    (${body.definitions[0].partOfSpeech || '???'}) ${body.definitions[0].text}
                `,
				)
				.setFooter('Powered by WordNik');
			return msg.util!.send({ embed });
		} catch (err) {
			return msg.util!.reply(`Oh crap. An error occured: \`${err.message}\`. Try again later.`);
		}
	}
}
