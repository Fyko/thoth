import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import fetch from 'node-fetch';
const { WORDNIK_KEY } = process.env;

interface IWordDefinition {
	id: string;
	partOfSpeech: string;
	attributionText: string;
	sourceDictionary: string;
	text: string;
	sequence: string;
	score: number;
	labels: unknown[];
	citations: unknown[];
	word: string;
	relatedWords: any[];
	exampleUses: { text: string }[];
	textProns: unknown[];
	notes: unknown[];
	attributionUrl: string;
	wordnikUrl: string;
}

type IWordDefinitionResponse = IWordDefinition[];
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
		const url = new URL(`http://api.wordnik.com/v4/word.json/${word}/definitions`);
		try {
			url.searchParams.append('limit', '1');
			url.searchParams.append('includeRelated', 'false');
			url.searchParams.append('useCanonical', 'true');
			url.searchParams.append('api_key', WORDNIK_KEY!);
			const res = await fetch(url);
			const body: IWordDefinitionResponse = await res.json();
			if (!body.length) return msg.util!.reply("couldn't find any results for your query!");
			const data = body[0];
			const embed = this.client.util
				.embed()
				.setColor('#FF6713')
				.setAuthor(data.word, 'https://www.wordnik.com/img/wordnik_heart_48.png')
				.setDescription(
					stripIndents`
                    (${data.partOfSpeech || '???'}) - ${data.text}
                `,
				)
				.setFooter('Powered by Wordnik');
			return msg.util!.send(embed);
		} catch (err) {
			return msg.reply(`Oh crap. An error occured: \`${err.message}\`. Try again later.`);
		}
	}
}
