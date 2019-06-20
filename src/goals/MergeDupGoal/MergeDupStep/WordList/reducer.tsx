import {
  WordListAction,
  ADD_LIST_WORD,
  REMOVE_LIST_WORD,
  CLEAR_LIST_WORDS,
  SET_LIST_WORDS_SORT
} from "./actions";
import { Word } from "../../../../types/word";

export interface WordListState {
  words: Word[];
  sortComparison: (wordA: Word, wordB: Word) => number;
}

export const defaultState: WordListState = {
  words: [],
  sortComparison: (a: Word, b: Word): number =>
    a.vernacular.localeCompare(b.vernacular)
};

export const wordListReducer = (
  state: WordListState = defaultState, //createStore() calls each reducer with undefined state
  action: WordListAction
): WordListState => {
  switch (action.type) {
    case SET_LIST_WORDS_SORT:
      if (action.payload.sort) {
        return { ...state, sortComparison: action.payload.sort };
      } else {
        return state;
      }
    case ADD_LIST_WORD: //_LIST_WORD actions affect the list of possible duplicates
      var words = state.words;
      words = words.concat(action.payload.words);
      words = words.sort(state.sortComparison);
      return { ...state, words };
    case REMOVE_LIST_WORD:
      var words = state.words;
      action.payload.words.forEach(word => {
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
