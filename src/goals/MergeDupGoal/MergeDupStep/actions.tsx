import {Word, simpleWord, State} from "../../../types/word";
import {StoreState} from "../../../types";
import * as backend from "../../../backend";
import {WordListAction, refreshListWords} from "./WordList/actions";
import {ThunkDispatch} from "redux-thunk";

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

export const CLEAR_MERGES = "CLEAR_MERGES";
export type CLEAR_MERGES = typeof CLEAR_MERGES;

export const SWAP_DUPLICATE = "SWAP_DUPLICATE";
export type SWAP_DUPLICATE = typeof SWAP_DUPLICATE;

export interface MergeTreeAction {
  type:
  | ADD_PARENT
  | CLEAR_MERGES
  | ADD_SENSE
  | ADD_DUPLICATE
  | REMOVE_DUPLICATE
  | SWAP_DUPLICATE;
  payload: {word: Word; parent?: number};
}

export function moveDuplicate(word: Word, dest: number): MergeTreeAction {
  return {
    type: SWAP_DUPLICATE,
    payload: {word, parent: dest}
  };
}

export function addParent(word: Word): MergeTreeAction {
  return {
    type: ADD_PARENT,
    payload: {word}
  };
}

export function addSense(word: Word, parent: number): MergeTreeAction {
  return {
    type: ADD_SENSE,
    payload: {word, parent}
  };
}

export function addDuplicate(word: Word, parent: number): MergeTreeAction {
  return {
    type: ADD_DUPLICATE,
    payload: {word, parent}
  };
}

export function applyMerges() {
  return async (
    dispatch: ThunkDispatch<any, any, MergeTreeAction | WordListAction>,
    getState: () => StoreState
  ) => {
    var merges = getState().mergeDupStepProps.parentWords;
    Promise.all(
      merges.map(async parent => {
        var senses: Word[] = [];
        await Promise.all(
          parent.senses.map(async sense => {
            if (sense.dups.length > 1) {
              senses.push({
                ...sense.dups[0],
                id: await backend.mergeWords(sense.dups, State.duplicate)
              });
            } else {
              // Should never be 0
              senses.push(sense.dups[0]);
            }
          })
        );
        if (senses.length > 0) {
          return await backend.mergeWords(senses, State.sense);
        }
      })
    )
      .then(() => dispatch(clearMerges()))
      .then(() => dispatch(refreshListWords()));
  };
}

export function clearMerges(): MergeTreeAction {
  return {
    type: CLEAR_MERGES,
    payload: {word: simpleWord("", "")}
  };
}

export function removeDuplicate(word: Word, parent: number): MergeTreeAction {
  return {
    type: REMOVE_DUPLICATE,
    payload: {word, parent}
  };
}
