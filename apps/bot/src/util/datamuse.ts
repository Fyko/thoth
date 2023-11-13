import { URLSearchParams } from "node:url";
import { container } from "tsyringe";
import type { RedisManager } from "#structures";
import { kRedis } from "./symbols.js";

export type DatamuseHit = {
  score: number;
  word: string;
};

export type DatamuseResult = DatamuseHit[];

export enum DatamuseQuery {
  Adjective = "rel_jjb",
  CloseRhyme = "rel_nry",
  Holonym = "rel_com",
  Homophone = "rel_hom",
  Hyponym = "rel_gen",
  MeansLike = "ml",
  Noun = "rel_jja",
  Rhyme = "rel_rhy",
  SoundsLike = "sl",
  SpelledLike = "sp",
  ThatFollows = "lc",
  Triggers = "rel_trg",
}

const redis = container.resolve<RedisManager>(kRedis);

export async function fetchDatamuse(
  query: DatamuseQuery,
  word: string,
): Promise<DatamuseResult> {
  const params = new URLSearchParams();
  params.append(query, word);

  return fetchDatamuseRaw(params);
}

export async function fetchDatamuseRaw(
  query: URLSearchParams,
): Promise<DatamuseResult> {
  const qs = query.toString();
  const key = `datamuse:${qs}`;

  const cached = await redis.client.get(key);
  if (cached) return JSON.parse(cached);

  const url = `https://api.datamuse.com/words?${qs}`;

  const response = await fetch(url, {
    headers: {
      "user-agent": "Thoth (github.com/Fyko/Thoth)",
      accept: "application/json",
    },
  });

  const data = (await response.json()) as DatamuseResult;
  await redis.client.set(key, JSON.stringify(data), "EX", 60 * 60 * 24); // 24 hours

  return data;
}
