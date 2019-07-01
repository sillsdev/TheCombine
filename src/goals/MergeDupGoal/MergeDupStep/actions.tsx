import {Word, simpleWord, State} from "../../../types/word";
import {StoreState} from "../../../types";
import * as backend from "../../../backend";
import {WordListAction, refreshListWords} from "./WordList/actions";
import {ThunkDispatch} from "redux-thunk";
import {MergeTree} from './MergeDupsTree';

export enum MergeTreeActions {
  SET_VERNACULAR = "SET_VERNACULAR",
  SET_PLURAL = "SET_PLURAL",
  MOVE_SENSE = "MOVE_SENSE",
  SET_SENSE = "SET_SENSE",
}

export interface MergeTreeMoveAction {
  type: MergeTreeActions.MOVE_SENSE;
  payload: {src: MergeTree.Reference, dest: MergeTree.Reference};
}

export interface MergeTreeSetAction {
  type: MergeTreeActions.SET_SENSE;
  payload: {ref: MergeTree.Reference, data: number | undefined};
}

export interface MergeTreeWordAction {
  type: MergeTreeActions.SET_VERNACULAR | MergeTreeActions.SET_PLURAL;
  payload: {wordID: number, data: string};
}

export type MergeTreeAction = MergeTreeWordAction | MergeTreeMoveAction | MergeTreeSetAction;

// action creators
export function setVern(wordID: number, vern: string): MergeTreeAction {
  return {
    type: MergeTreeActions.SET_VERNACULAR,
    payload: {wordID, data: vern}
  };
}

export function setPlural(wordID: number, plural: string): MergeTreeAction {
  return {
    type: MergeTreeActions.SET_PLURAL,
    payload: {wordID, data: plural}
  };
}

export function moveSense(src: MergeTree.Reference, dest: MergeTree.Reference): MergeTreeAction {
  return {
    type: MergeTreeActions.MOVE_SENSE,
    payload: {src, dest}
  };
}

export function setSense(ref: MergeTree.Reference, data: number | undefined): MergeTreeAction {
  return {
    type: MergeTreeActions.SET_SENSE,
    payload: {ref, data}
  };
}

export function removeSense(ref: MergeTree.Reference): MergeTreeAction {
  return setSense(ref, undefined);
}


// this is gross lets clean it up
export function applyMerges() {
  return async (
    dispatch: ThunkDispatch<any, any, MergeTreeAction | WordListAction>,
    getState: () => StoreState
  ) => {
    var merges = getState().mergeDuplicateGoal.mergeTreeState.parentWords;
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
