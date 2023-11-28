import { subscriptCharacters, superscriptCharacters } from './constants.js';

export function subscript(content: string): string {
	const chars: string[] = [];
	for (const char of content) chars.push(Reflect.get(subscriptCharacters, char));
	return chars.join(' ');
}

export function superscript(content: string): string {
	const chars: string[] = [];
	for (const char of content) chars.push(Reflect.get(superscriptCharacters, char));
	return chars.join(' ');
}

export function smallCapitals(content: string): string {
	const chars: string[] = [];
	for (const char of content.toUpperCase()) chars.push(Reflect.get(superscriptCharacters, char));
	return chars.join(' ');
}
