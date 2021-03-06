import { Sense, Word } from "types/word";

export type Hash<V> = { [key: string]: V };

export type TreeDataSense = Sense & { srcWordId: string; order: number };

export interface MergeData {
  words: Hash<Word>;
  senses: Hash<TreeDataSense>;
}

export interface MergeTreeReference {
  wordId: string;
  senseId: string;
  duplicate: string;
}

export interface MergeTreeWord {
  senses: Hash<Hash<string>>;
  vern: string;
  plural: string;
}

export interface MergeTree {
  words: Hash<MergeTreeWord>;
}
