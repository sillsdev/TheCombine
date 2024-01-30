import { v4 } from "uuid";

import { Flag, Sense, Status, Word } from "api/models";
import { Hash } from "types/hash";
import { newFlag, newSense } from "types/word";

export interface MergeTreeSense {
  order: number;
  protected: boolean;
  srcWordId: string;
  sense: Sense;
}

export interface MergeData {
  words: Hash<Word>;
  senses: Hash<MergeTreeSense>;
}

export interface MergeTreeReference {
  wordId: string;
  mergeSenseId: string;
  order?: number;
  isSenseProtected?: boolean;
}

export interface MergeTreeWord {
  sensesGuids: Hash<string[]>;
  vern: string;
  flag: Flag;
  protected: boolean;
}

export function newMergeTreeSense(
  gloss: string,
  srcWordId: string,
  order: number,
  guid?: string
): MergeTreeSense {
  return {
    order,
    protected: false,
    srcWordId,
    sense: guid ? { ...newSense(gloss), guid } : newSense(gloss),
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
  sense: Sense,
  srcWordId = "",
  order = 0
): MergeTreeSense {
  return {
    order,
    protected: sense?.accessibility === Status.Protected,
    srcWordId,
    sense,
  };
}

export function convertWordToMergeTreeWord(word: Word): MergeTreeWord {
  const mergeTreeWord = newMergeTreeWord(word.vernacular);
  word.senses.forEach((sense) => {
    mergeTreeWord.sensesGuids[v4()] = [sense.guid];
  });
  mergeTreeWord.flag = word.flag;
  mergeTreeWord.protected = word.accessibility === Status.Protected;
  return mergeTreeWord;
}

export interface Sidebar {
  mergeSenses: MergeTreeSense[];
  wordId: string;
  mergeSenseId: string;
}

export const defaultSidebar: Sidebar = {
  mergeSenses: [],
  wordId: "",
  mergeSenseId: "",
};

export interface MergeTree {
  sidebar: Sidebar;
  words: Hash<MergeTreeWord>;
}

export const defaultTree: MergeTree = { sidebar: defaultSidebar, words: {} };
