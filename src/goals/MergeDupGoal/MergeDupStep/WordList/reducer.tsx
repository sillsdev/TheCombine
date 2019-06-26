import {
  WordListAction,
  ADD_LIST_WORD,
  REMOVE_LIST_WORD,
  CLEAR_LIST_WORDS,
  SET_LIST_WORDS_SORT
} from "./actions";
import { Word } from "../../../../types/word";

export enum SortStyle {
  VERN_ASC,
  VERN_DEC
}

function sortFunction(style: SortStyle): (a: Word, b: Word) => number {
  switch (style) {
    case SortStyle.VERN_ASC:
      return (a: Word, b: Word): number =>
        a.vernacular.localeCompare(b.vernacular);
    case SortStyle.VERN_DEC:
      return (a: Word, b: Word): number =>
        b.vernacular.localeCompare(a.vernacular);
  }
}

export interface WordListState {
  words: Word[];
  sortStyle: SortStyle;
}

export const defaultState: WordListState = {
  words: [],
  sortStyle: SortStyle.VERN_ASC
};

const wordListReducer = (
  state: WordListState = defaultState, //createStore() calls each reducer with undefined state
  action: WordListAction
): WordListState => {
  switch (action.type) {
    case SET_LIST_WORDS_SORT:
      if (action.payload.sort) {
        return { ...state, sortStyle: action.payload.sort };
      } else {
        return state;
      }
    case ADD_LIST_WORD: //_LIST_WORD actions affect the list of possible duplicates
      var words = state.words;
      words = words.concat(action.payload.words);
      words = words.sort(sortFunction(state.sortStyle));
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

export default wordListReducer;
