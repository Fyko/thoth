import { setInterval, clearInterval } from 'node:timers';
import { type Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import { kSQL } from '#util/symbols.js';

@injectable()
export class BlockedWordModule {
	private readonly _interval: NodeJS.Timeout;

	public words: string[] = [];

	public constructor(@inject(kSQL) protected readonly sql: Sql<any>) {
		void this.refresh();
		this._interval = setInterval(this.refresh.bind(this), 60_000);
	}

	/**
	 * Checks if a word is blocked
	 *
	 * @param word - The word to check
	 * @returns boolean
	 */
	public check(word: string) {
		return this.words.includes(word);
	}

	public async add(word: string) {
		await this
			.sql`insert into public.blocked_words (word) values (${word}) on conflict (word) do update set created_at = now()`;
		this.words.push(word);
	}

	public async remove(word: string) {
		await this.sql`delete from public.blocked_words where word = ${word}`;
		const index = this.words.indexOf(word);
		this.words.splice(index, 1);
	}

	private async refresh() {
		const words = await this.sql<{ word: string }[]>`
			select word from public.blocked_words;
		`;

		this.words = words.map((word) => word.word);
	}

	public destroy() {
		clearInterval(this._interval);
	}
}
