import * as Data from "types/word";

export type Hash<V> = { [key: string]: V };

export type TreeDataSense = Data.Sense & { srcWord: string; order: number };

export interface MergeData {
  words: Hash<Data.Word>;
  senses: Hash<TreeDataSense>;
}

export interface MergeTreeReference {
  word: string;
  sense: string;
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

export const defaultTree = {
  words: {},
};

export const defaultData = {
  words: {},
  senses: {},
};
