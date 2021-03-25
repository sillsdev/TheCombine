import { Sense, Word } from "types/word";

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

export const defaultTree = { sidebar: defaultSidebar, words: {} };
