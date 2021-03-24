import { Sense, Word } from "types/word";

export type Hash<V> = { [key: string]: V };

export interface MergeTreeSense extends Sense {
  srcWordId: string;
  index: number;
}

export interface MergeData {
  words: Hash<Word>;
  senses: Hash<MergeTreeSense>;
}

export interface MergeTreeRef {
  wordId: string;
  mergeSenseId: string;
}

export interface MergeTreeRefWithGuid extends MergeTreeRef {
  guid: string;
}

export interface MergeTreeRefWithIndex extends MergeTreeRef {
  index: number;
}

export interface MergeTreeWord {
  sensesGuids: Hash<string[]>;
  vern: string;
  plural: string;
}

export interface MergeTree {
  words: Hash<MergeTreeWord>;
}
