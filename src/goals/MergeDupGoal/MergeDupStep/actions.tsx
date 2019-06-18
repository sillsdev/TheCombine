import { Word, simpleWord, Merge } from "../../../types/word";

// Args: (word: Word)
export const ADD_PARENT = "ADD_PARENT";
export type ADD_PARENT = typeof ADD_PARENT;

// Args: (word: Word, parent: Word)
export const ADD_SENSE = "ADD_SENSE";
export type ADD_SENSE = typeof ADD_SENSE;

// Args: (word: Word, parent: Word)
export const ADD_DUPLICATE = "ADD_DUPLICATE";
export type ADD_DUPLICATE = typeof ADD_DUPLICATE;

export const REMOVE_DUPLICATE = "REMOVE_DUPLICATE";
export type REMOVE_DUPLICATE = typeof REMOVE_DUPLICATE;

export const APPLY_MERGES = "APPLY_MERGES";
export type APPLY_MERGES = typeof APPLY_MERGES;

export const ADD_LIST_WORD = "ADD_LIST_WORD";
export type ADD_LIST_WORD = typeof ADD_LIST_WORD;

export const REMOVE_LIST_WORD = "REMOVE_LIST_WORD";
export type REMOVE_LIST_WORD = typeof REMOVE_LIST_WORD;

export const CLEAR_LIST_WORDS = "CLEAR_LIST_WORDS";
export type CLEAR_LIST_WORDS = typeof CLEAR_LIST_WORDS;

export const SORT_LIST_WORDS = "SORT_LIST_WORDS";
export type SORT_LIST_WORDS = typeof SORT_LIST_WORDS;

export interface MergeAction {
  type:
    | ADD_PARENT
    | ADD_SENSE
    | ADD_DUPLICATE
    | APPLY_MERGES
    | REMOVE_DUPLICATE
    | ADD_LIST_WORD
    | REMOVE_LIST_WORD
    | CLEAR_LIST_WORDS
    | SORT_LIST_WORDS;
  payload: { word: Word; parent?: number };
}

export function clearListWords(): MergeAction {
  return {
    type: CLEAR_LIST_WORDS,
    payload: { word: simpleWord("", "") }
  };
}

export function addListWord(word: Word): MergeAction {
  return {
    type: ADD_LIST_WORD,
    payload: { word }
  };
}

export function removeListWord(word: Word): MergeAction {
  return {
    type: REMOVE_LIST_WORD,
    payload: { word }
  };
}

export function addParent(word: Word): MergeAction {
  return {
    type: ADD_PARENT,
    payload: { word }
  };
}

export function addSense(word: Word, parent: number): MergeAction {
  return {
    type: ADD_SENSE,
    payload: { word, parent }
  };
}

export function addDuplicate(word: Word, parent: number): MergeAction {
  return {
    type: ADD_DUPLICATE,
    payload: { word, parent }
  };
}

export function applyMerges(): MergeAction {
  return {
    type: APPLY_MERGES,
    payload: { word: simpleWord("", "") }
  };
}

export function removeDuplicate(word: Word, parent: number): MergeAction {
  return {
    type: REMOVE_DUPLICATE,
    payload: { word, parent }
  };
}

export function sortWords(): MergeAction {
  return {
    type: SORT_LIST_WORDS,
    payload: undefined as any
  };
}
