import fetch, { Response } from 'node-fetch';
import { URL } from 'url';
import type { Entry } from 'mw-collegiate';

const baseURL = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';

function requestFailed(response: Response): boolean {
	const contentType = response.headers.get('content-type');
	if (!response.ok || contentType?.includes('text/html')) return true;
	return false;
}

export async function fetchDefinition(word: string, apiKey = process.env.MW_API_KEY): Promise<Entry> {
	if (!apiKey) throw Error('No API key!');

	const base = new URL(baseURL + encodeURIComponent(word));
	base.searchParams.append('key', apiKey);

	const response = await fetch(base);
	if (requestFailed(response)) {
		const error = new Error(`Uh oh! Shit hit the fan.`);
		error.message = await response.text();
		throw error;
	}

	const body: Entry[] = await response.json();

	return body[0];
}
