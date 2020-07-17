import fetch from 'node-fetch';

export function codeb(data: any, lang?: string) {
	const bt = '`';
	return lang ? `${bt.repeat(3)}${lang}\n${data}${bt.repeat(3)}` : `${bt}${data}${bt}`;
}

export function localize(number: number, locale = 'en-US'): string {
	try {
		return new Intl.NumberFormat(locale).format(number);
	} catch {}
	return new Intl.NumberFormat('en-US').format(number);
}

export function trimArray(arr: any[], maxLen = 10): any[] {
	if (arr.length > maxLen) {
		const len = arr.length - maxLen;
		arr = arr.slice(0, maxLen);
		arr.push(`${len} more...`);
	}
	return arr;
}

export function firstUpperCase(text: string, split = ' '): string {
	return text
		.split(split)
		.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join(' ');
}

export async function postHaste(code: string, lang?: string): Promise<string> {
	try {
		if (code.length > 400000) {
			return 'Document exceeds maximum length.';
		}
		const res = await fetch('https://paste.nomsy.net/documents', { method: 'POST', body: code });
		const { key, message }: { key: string; message: string } = await res.json();
		if (!key) {
			return message;
		}
		return `https://paste.nomsy.net/${key}${lang ? `.${lang}` : ''}`;
	} catch (err) {
		throw err;
	}
}
