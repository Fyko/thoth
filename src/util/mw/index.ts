import process from 'node:process';
import { URL } from 'node:url';
import type { Entry } from 'mw-collegiate';
import { fetch, type Response } from 'undici';
import { RedisManager } from '#structures';

const baseURL = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';
const thesaurusBaseURL = 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/';

function requestFailed(response: Response): boolean {
	const contentType = response.headers.get('content-type');
	return !response.ok || contentType!.includes('text/html');
}

export async function fetchDefinition(redis: RedisManager, word: string, apiKey = process.env.MW_API_KEY): Promise<Entry[] | string[]> {
	const key = RedisManager.createDefinitionKey(word);
	const cached = await redis.getDefinition(key);
	if (cached?.length) return cached;

	if (!apiKey) throw new Error('No API key!');

	const base = new URL(baseURL + encodeURIComponent(word));
	base.searchParams.append('key', apiKey);

	const response = await fetch(base.toString());
	if (requestFailed(response)) {
		const error = new Error(`Uh oh! Shit hit the fan.`);
		error.message = await response.text();
		throw error;
	}

	const data = await response.json();
	await redis.client.set(key, JSON.stringify(data), 'EX', 60 * 60 * 24);

	return data as Entry[] | string[];
}

export async function fetchSynonyms(word: string, apiKey = process.env.MW_API_KEY): Promise<Record<string, unknown>> {
	if (!apiKey) throw new Error('No API key!');

	const base = new URL(thesaurusBaseURL + encodeURIComponent(word));
	base.searchParams.append('key', apiKey);

	const response = await fetch(base.toString());
	if (requestFailed(response)) {
		const error = new Error(`Uh oh! Shit hit the fan.`);
		error.message = await response.text();
		throw error;
	}

	return (await response.json()) as Record<string, unknown>;
}

export function createPronunciationURL(audio?: string): string {
	if (!audio) return '';

	const first = audio[0];

	let subdir = first;
	if (audio.startsWith('bix')) {
		subdir = 'bix';
	} else if (audio.startsWith('gg')) {
		subdir = 'gg';
	} else if (!Number.isNaN(Number.parseInt(first, 10)) || audio.startsWith('_')) {
		subdir = 'number';
	}

	return `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audio}.mp3`;
}
