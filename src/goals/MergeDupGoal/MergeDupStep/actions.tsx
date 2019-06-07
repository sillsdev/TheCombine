import { Word, Merge, simpleWord } from "../../../types/word";

export const ADD_MERGE = "ADD_MERGE";
export type ADD_MERGE = typeof ADD_MERGE;

export const UPDATE_MERGE = "UPDATE_MERGE";
export type UPDATE_MERGE = typeof UPDATE_MERGE;

export const CLEAR_MERGES = "CLEAR_MERGES";
export type CLEAR_MERGES = typeof CLEAR_MERGES;

export interface MergeAction {
  type: ADD_MERGE | UPDATE_MERGE | CLEAR_MERGES;
  payload: { merge: Word; parent?: Word[] };
}

export function addMerge(merge: Word): MergeAction {
  return {
    type: ADD_MERGE,
    payload: { merge }
  };
}

export function addWordToMerge(word: Word, parent: Word[]): MergeAction {
  return {
    type: UPDATE_MERGE,
    payload: { merge: word, parent }
  };
}

export function clearMerges(): MergeAction {
  return {
    type: CLEAR_MERGES,
    payload: { merge: simpleWord("", "") }
  };
}
