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
  state: WordListState = defaultState, //createStore() calls each reducer with undefined state
  action: WordListAction
): WordListState => {
  let words: Word[];
  switch (action.type) {
    case ADD_LIST_WORD: //_LIST_WORD actions affect the list of possible duplicates
      words = state.words;
      words = words.concat(action.payload);
      return { ...state, words };
    case REMOVE_LIST_WORD:
      words = state.words;
      action.payload.forEach(word => {
        // finds last matching by index
        var foundIndex = words.lastIndexOf(word);
        // remove previously found word
        words = words.filter((_, index) => index !== foundIndex);
      });
      return { ...state, words };
    case CLEAR_LIST_WORDS:
      return { ...state, words: [] };
    default:
      return state;
  }
};
