import { WordDragAction } from "./actions";
import { DRAG_WORD, DROP_WORD } from "./actions";
import {MergeTreeReference} from '../../goals/MergeDupGoal/MergeDupStep/MergeDupsTree';

export interface WordDragState {
  draggedWord?: MergeTreeReference;
}

export const defaultState: WordDragState = {
  draggedWord: undefined
};

const dragWordReducer = (
  state: WordDragState = defaultState, //createStore() calls each reducer with undefined state
  action: WordDragAction
): WordDragState => {
  switch (action.type) {
    case DRAG_WORD:
      if (action.payload) {
        return { ...state, draggedWord: action.payload };
      } else {
        return state;
      }
    case DROP_WORD:
      return { ...state, draggedWord: undefined };
    default:
      return state;
  }
};

export default dragWordReducer;
