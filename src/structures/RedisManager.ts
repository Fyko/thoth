import type { RedisOptions } from 'ioredis';
import { default as Redis } from 'ioredis';
import type { Entry } from 'mw-collegiate';
import { injectable } from 'tsyringe';

@injectable()
export class RedisManager {
	public readonly client: Redis.Redis;

	public constructor(options: RedisOptions) {
		this.client = new Redis.default(options);
	}

	public static createDefinitionKey(word: string): string {
		return `definition:${word}`;
	}

	public async getDefinition(key: string): Promise<Entry[] | string[] | null> {
		const res = await this.client.get(key);
		return res ? JSON.parse(res) : null;
	}
}