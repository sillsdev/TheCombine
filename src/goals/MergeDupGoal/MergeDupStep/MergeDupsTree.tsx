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
  order: number;
}

export interface MergeTreeWord {
  sensesGuids: Hash<string[]>;
  vern: string;
  plural: string;
}

export interface SideBar {
  senses: MergeTreeSense[];
  wordId: string;
  mergeSenseId: string;
}

export const defaultSideBar: SideBar = {
  senses: [],
  wordId: "",
  mergeSenseId: "",
};

export interface MergeTree {
  sideBar: SideBar;
  words: Hash<MergeTreeWord>;
}

export const defaultTree = { sideBar: defaultSideBar, words: {} };
