import { MergeDupStepProps } from "../component";
import {
  WordListAction,
  ADD_LIST_WORD,
  REMOVE_LIST_WORD,
  CLEAR_LIST_WORDS
} from "./actions";
import { Word } from "../../../../types/word";

export interface WordListState {
  words: Word[];
}

export const defaultState: WordListState = {
  words: []
};

export const wordListReducer = (
  state: WordListState | undefined, //createStore() calls each reducer with undefined state
  action: WordListAction
): WordListState => {
  if (!state) return defaultState;
  switch (action.type) {
    case ADD_LIST_WORD: //_LIST_WORD actions affect the list of possible duplicates
      var words = state.words;
      words = words.concat(action.payload);
      return { ...state, words };
    case REMOVE_LIST_WORD:
      var words = state.words;
      // finds last matching by index
      var foundIndex = words.lastIndexOf(action.payload);
      // remove previously found word
      words = words.filter((_, index) => index !== foundIndex);
      return { ...state, words };
    case CLEAR_LIST_WORDS:
      return { ...state, words: [] };
    default:
      return state;
  }
};
