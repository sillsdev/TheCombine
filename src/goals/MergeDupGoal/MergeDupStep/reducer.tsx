import {MergeTreeAction, MergeTreeActions} from "./actions";
import {MergeTree, defaultData, defaultTree, MergeData} from './MergeDupsTree';

export const defaultState: MergeTreeState = {
  data: defaultData,
  tree: defaultTree
};

export interface MergeTreeState {
  data: MergeData;
  tree: MergeTree;
}

const mergeDupStepReducer = (
  state: MergeTreeState = defaultState, //createStore() calls each reducer with undefined state
  action: MergeTreeAction
): MergeTreeState => {
  switch (action.type) {
    // This is clearly the best reducer ever written
    case MergeTreeActions.SET_VERNACULAR:
    case MergeTreeActions.SET_PLURAL:
    case MergeTreeActions.MOVE_SENSE:
    case MergeTreeActions.SET_SENSE:
    default:
      return state;
  }
};
export default mergeDupStepReducer;
