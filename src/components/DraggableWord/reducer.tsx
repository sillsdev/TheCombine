import { WordDragAction } from "./actions";
import { DRAG_WORD, DROP_WORD } from "./actions";
import { Word } from "../../types/word";

export interface WordDragState {
  draggedWord?: Word;
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
        action.payload.modified = Date.now().toString();
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
