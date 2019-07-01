import {StoreState} from "../../../types";
import {ThunkDispatch} from "redux-thunk";
import {MergeTreeReference} from './MergeDupsTree';

export enum MergeTreeActions {
  SET_VERNACULAR = "SET_VERNACULAR",
  SET_PLURAL = "SET_PLURAL",
  MOVE_SENSE = "MOVE_SENSE",
  SET_SENSE = "SET_SENSE",
}

interface MergeTreeMoveAction {
  type: MergeTreeActions.MOVE_SENSE;
  payload: {src: MergeTreeReference, dest: MergeTreeReference};
}

interface MergeTreeSetAction {
  type: MergeTreeActions.SET_SENSE;
  payload: {ref: MergeTreeReference, data: number | undefined};
}

interface MergeTreeWordAction {
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

export function moveSense(src: MergeTreeReference, dest: MergeTreeReference): MergeTreeAction {
  return {
    type: MergeTreeActions.MOVE_SENSE,
    payload: {src, dest}
  };
}

export function setSense(ref: MergeTreeReference, data: number | undefined): MergeTreeAction {
  return {
    type: MergeTreeActions.SET_SENSE,
    payload: {ref, data}
  };
}

export function removeSense(ref: MergeTreeReference): MergeTreeAction {
  return setSense(ref, undefined);
}

export function mergeSense() {
  return async (
    _dispatch: ThunkDispatch<any, any, MergeTreeAction>,
    _getState: () => StoreState
  ) => {
    // TODO: Merge all duplicates into sense and remove them from tree leaving new word on top 
  };
}
  /*
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
} */
