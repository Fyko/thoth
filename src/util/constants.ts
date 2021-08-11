import { italic } from '@discordjs/builders';

export enum Colors {
	Primary = 7506394,
	GiveawayOver = 3553599,
}

export enum Emojis {
	Wordnik = '<:wordnik:874901511577174026>',
}

export const enum Characters {
	Bullet = '•',
}

export const enum SuperscriptNumbers {
	Zero = '\u2070',
	One = '\u00b9',
	Two = '\u00b2',
	Three = '\u00b3',
	Four = '\u2074',
	Five = '\u2075',
	Six = '\u2076',
	Seven = '\u2077',
	Eight = '\u2078',
	Nine = '\u2079',
}

export const superscriptNumbers = {
	0: SuperscriptNumbers.Zero,
	1: SuperscriptNumbers.One,
	2: SuperscriptNumbers.Two,
	3: SuperscriptNumbers.Three,
	4: SuperscriptNumbers.Four,
	5: SuperscriptNumbers.Five,
	6: SuperscriptNumbers.Six,
	7: SuperscriptNumbers.Seven,
	8: SuperscriptNumbers.Eight,
	9: SuperscriptNumbers.Nine,
} as const;

export const pingResponses = [
	'Uhh, hello?',
	"What can I do ya' for?",
	'Why are you bothering me?',
	'Mhm?',
	'Yea?',
	"What's with you puny humans and the constant desire to bother me?",
	'Out of everyone here, you chose to bother me?',
	`So ${italic('this')} is the meaning of life?`,
	'Can we just get this over with?? I have stuff to do.',
	"That's all?",
	'Pong!',
	'Do it again. I dare you.',
];
