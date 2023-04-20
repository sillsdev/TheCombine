import { v4 } from "uuid";

import { Flag, Sense, Status, Word } from "api/models";
import { Hash } from "types/hash";
import { newFlag, newSense } from "types/word";

export interface MergeTreeSense extends Sense {
  srcWordId: string;
  order: number;
  protected: boolean;
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
  protected: boolean;
}

export function newMergeTreeSense(
  gloss = "",
  srcWordId = "",
  order = 0
): MergeTreeSense {
  return {
    ...newSense(gloss),
    srcWordId,
    order,
    protected: false,
  };
}

export function newMergeTreeWord(
  vern = "",
  sensesGuids?: Hash<string[]>
): MergeTreeWord {
  return {
    vern,
    sensesGuids: sensesGuids ?? {},
    flag: newFlag(),
    protected: false,
  };
}

export function convertSenseToMergeTreeSense(
  sense?: Sense,
  srcWordId = "",
  order = 0
): MergeTreeSense {
  return {
    ...(sense ?? newSense()),
    srcWordId,
    order,
    protected: sense?.accessibility === Status.Protected,
  };
}

export function convertWordtoMergeTreeWord(word: Word): MergeTreeWord {
  const mergeTreeWord = newMergeTreeWord(word.vernacular);
  word.senses.forEach((sense) => {
    mergeTreeWord.sensesGuids[v4()] = [sense.guid];
  });
  mergeTreeWord.flag = word.flag;
  mergeTreeWord.protected = word.accessibility === Status.Protected;
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
