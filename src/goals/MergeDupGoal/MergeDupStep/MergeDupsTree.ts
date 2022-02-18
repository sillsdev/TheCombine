import { v4 } from "uuid";

import { Flag, Sense, Word } from "api/models";
import { newFlag } from "types/word";

export type Hash<V> = { [key: string]: V };

export interface MergeTreeSense extends Sense {
  srcWordId: string;
  order: number;
}

export interface MergeData {
  words: Hash<Word>;
  senses: Hash<MergeTreeSense>;
}

export interface MergeTreeReference {
  wordId: string;
  mergeSenseId: string;
  order?: number;
}

export interface MergeTreeWord {
  sensesGuids: Hash<string[]>;
  vern: string;
  flag: Flag;
}

export function newMergeTreeWord(
  vern = "",
  sensesGuids?: Hash<string[]>
): MergeTreeWord {
  return { vern, sensesGuids: sensesGuids ?? {}, flag: newFlag() };
}

export function convertWordtoMergeTreeWord(word: Word): MergeTreeWord {
  const mergeTreeWord = newMergeTreeWord(word.vernacular);
  word.senses.forEach((sense) => {
    mergeTreeWord.sensesGuids[v4()] = [sense.guid];
  });
  mergeTreeWord.flag = word.flag;
  return mergeTreeWord;
}

export interface Sidebar {
  senses: MergeTreeSense[];
  wordId: string;
  mergeSenseId: string;
}

export const defaultSidebar: Sidebar = {
  senses: [],
  wordId: "",
  mergeSenseId: "",
};

export interface MergeTree {
  sidebar: Sidebar;
  words: Hash<MergeTreeWord>;
}

export const defaultTree: MergeTree = { sidebar: defaultSidebar, words: {} };
