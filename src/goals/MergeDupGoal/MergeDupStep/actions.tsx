import { Word, Merge, simpleWord } from "../../../types/word";

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

export interface MergeAction {
  type:
    | ADD_PARENT
    | ADD_SENSE
    | ADD_DUPLICATE
    | APPLY_MERGES
    | REMOVE_DUPLICATE;
  payload: { merge: Word; parent?: number };
}

export function addParent(merge: Word): MergeAction {
  return {
    type: ADD_PARENT,
    payload: { merge }
  };
}

export function addSense(word: Word, parent: number): MergeAction {
  return {
    type: ADD_SENSE,
    payload: { merge: word, parent }
  };
}

export function addDuplicate(word: Word, parent: number): MergeAction {
  return {
    type: ADD_DUPLICATE,
    payload: { merge: word, parent }
  };
}

export function applyMerges(): MergeAction {
  return {
    type: APPLY_MERGES,
    payload: { merge: simpleWord("", "") }
  };
}

export function removeDuplicate(word: Word, parent: number): MergeAction {
  return {
    type: REMOVE_DUPLICATE,
    payload: { merge: word, parent }
  };
}
