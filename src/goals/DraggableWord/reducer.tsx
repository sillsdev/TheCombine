import { WordDrag } from "./actions";
import { DRAG_WORD, DROP_WORD } from "./actions";
import { WebkitBorderBeforeWidthProperty } from "csstype";
import { Word, simpleWord } from "../../types/word";

export interface WordDragState {
  draggedWord?: Word;
}

export const defaultState: WordDragState = {
  draggedWord: undefined
};

export const dragWordReducer = (
  state: WordDragState | undefined, //createStore() calls each reducer with undefined state
  action: WordDrag
): WordDragState => {
  //console.log('reducer reached');
  if (!state) return defaultState;
  switch (action.type) {
    case DRAG_WORD:
      console.log(action.payload + " has been dragged");
      return { ...state, draggedWord: action.payload };
    case DROP_WORD:
      console.log("dropping dragged word");
      return { ...state, draggedWord: undefined };
    default:
      return state;
  }
};
