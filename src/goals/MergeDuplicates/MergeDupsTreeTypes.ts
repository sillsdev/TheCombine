import { v4 } from "uuid";

import {
  type Flag,
  type Note,
  type ProtectReason,
  type Sense,
  Status,
  type Word,
} from "api/models";
import { type Hash } from "types/hash";
import { newFlag, newNote, newSense } from "types/word";

export interface MergeTreeSense {
  order: number;
  protected: boolean;
  protectReasons?: ProtectReason[];
  srcWordId: string;
  sense: Sense;
}

export interface MergeData {
  words: Hash<Word>;
  senses: Hash<MergeTreeSense>;
}

export const defaultData: MergeData = { words: {}, senses: {} };

export interface MergeTreeReference {
  wordId: string;
  mergeSenseId: string;
  order?: number;
  isSenseProtected?: boolean;
  protectReasons?: ProtectReason[];
}

export interface MergeTreeWord {
  sensesGuids: Hash<string[]>;
  vern: string;
  flag: Flag;
  note: Note;
  protected: boolean;
  protectReasons?: ProtectReason[] | null;
  audioCount: number;
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
    note: newNote(),
    protected: false,
    audioCount: 0,
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
    protectReasons: sense?.protectReasons ?? undefined,
    srcWordId,
    sense,
  };
}

export function convertWordToMergeTreeWord(word: Word): MergeTreeWord {
  const mergeTreeWord = newMergeTreeWord(word.vernacular);
  word.senses.forEach((sense) => {
    mergeTreeWord.sensesGuids[v4()] = [sense.guid];
  });
  mergeTreeWord.flag = { ...word.flag };
  mergeTreeWord.note = { ...word.note };
  mergeTreeWord.protected = word.accessibility === Status.Protected;
  mergeTreeWord.protectReasons = word.protectReasons;
  mergeTreeWord.audioCount = word.audio.length;
  return mergeTreeWord;
}

export interface Sidebar {
  mergeSenses: MergeTreeSense[];
  senseRef: MergeTreeReference;
}

export const defaultSidebar: Sidebar = {
  mergeSenses: [],
  senseRef: {
    wordId: "",
    mergeSenseId: "",
  },
};

export interface MergeTree {
  deletedSenseGuids: string[];
  sidebar: Sidebar;
  words: Hash<MergeTreeWord>;
}

export const defaultTree: MergeTree = {
  deletedSenseGuids: [],
  sidebar: defaultSidebar,
  words: {},
};
