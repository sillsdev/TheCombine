import { Sense, Word } from "types/word";

export type Hash<V> = { [key: string]: V };

export type TreeDataSense = Sense & { srcWordId: string; order: number };

export interface MergeData {
  words: Hash<Word>;
  senses: Hash<TreeDataSense>;
}

export interface MergeTreeReference {
  wordId: string;
  mergeSenseId: string;
  duplicateId: string;
}

export interface MergeTreeWord {
  sensesGuids: Hash<Hash<string>>;
  vern: string;
  plural: string;
}

export interface MergeTree {
  words: Hash<MergeTreeWord>;
}
