import { BitField } from "@sapphire/bitfield";
import { PermissionFlagsBits } from "discord-api-types/v10";

export const Permissions = new BitField(PermissionFlagsBits);

export enum Colors {
	Primary = 7_506_394,
	GiveawayOver = 3_553_599,
}

export enum Emojis {
	MerriamWebster = '<:mw:882044142333620235>',
}

export const enum Characters {
	Bullet = '•',
}

export const enum SuperscriptNumbers {
	Eight = '\u2078',
	Five = '\u2075',
	Four = '\u2074',
	Nine = '\u2079',
	One = '\u00B9',
	Seven = '\u2077',
	Six = '\u2076',
	Three = '\u00B3',
	Two = '\u00B2',
	Zero = '\u2070',
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
