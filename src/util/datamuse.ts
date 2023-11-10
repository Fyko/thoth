import { URLSearchParams } from 'node:url';

export type DatamuseHit = {
	score: number;
	word: string;
};

export type DatamuseResult = DatamuseHit[];

export enum DatamuseQuery {
	Adjective = 'rel_jjb',
	CloseRhyme = 'rel_nry',
	Holonym = 'rel_com',
	Homophone = 'rel_hom',
	Hyponym = 'rel_gen',
	MeansLike = 'ml',
	Noun = 'rel_jja',
	Rhyme = 'rel_rhy',
	SoundsLike = 'sl',
	SpelledLike = 'sp',
	ThatFollows = 'lc',
	Triggers = 'rel_trg',
}

export async function fetchDatamuse(query: DatamuseQuery, word: string): Promise<DatamuseResult> {
	const params = new URLSearchParams();
	params.append(query, word);

	return fetchDatamuseRaw(params);
}

export async function fetchDatamuseRaw(query: URLSearchParams): Promise<DatamuseResult> {
	const url = `https://api.datamuse.com/words?${query}`;

	const response = await fetch(url, {
		headers: {
			'user-agent': 'Thoth (github.com/Fyko/Thoth)',
			accept: 'application/json',
		},
	});

	return (await response.json()) as DatamuseResult;
}
