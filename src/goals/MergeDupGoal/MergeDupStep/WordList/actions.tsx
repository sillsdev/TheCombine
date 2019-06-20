import { Word } from "../../../../types/word";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../../types";
import DupFinder from "../../DuplicateFinder/DuplicateFinder";
import { SortStyle } from "./reducer";

// wordlist actions

export const ADD_LIST_WORD = "ADD_LIST_WORD";
export type ADD_LIST_WORD = typeof ADD_LIST_WORD;

export const REMOVE_LIST_WORD = "REMOVE_LIST_WORD";
export type REMOVE_LIST_WORD = typeof REMOVE_LIST_WORD;

export const CLEAR_LIST_WORDS = "CLEAR_LIST_WORDS";
export type CLEAR_LIST_WORDS = typeof CLEAR_LIST_WORDS;

export const SET_LIST_WORDS_SORT = "SET_LIST_WORDS_SORT";
export type SET_LIST_WORDS_SORT = typeof SET_LIST_WORDS_SORT;

export interface WordListAction {
  type:
    | ADD_LIST_WORD
    | REMOVE_LIST_WORD
    | CLEAR_LIST_WORDS
    | SET_LIST_WORDS_SORT;
  payload: { words: Word[]; sort?: SortStyle };
}

export function setListWordsSort(sort: SortStyle): WordListAction {
  return {
    type: SET_LIST_WORDS_SORT,
    payload: { words: [], sort }
  };
}

export function clearListWords(): WordListAction {
  return {
    type: CLEAR_LIST_WORDS,
    payload: { words: [] }
  };
}

export function addListWords(words: Word[]): WordListAction {
  return {
    type: ADD_LIST_WORD,
    payload: { words }
  };
}

export function removeListWords(words: Word[]): WordListAction {
  return {
    type: REMOVE_LIST_WORD,
    payload: { words }
  };
}

export function refreshListWords() {
  return async (
    dispatch: ThunkDispatch<any, any, WordListAction>,
    getState: () => StoreState
  ) => {
    let Finder = new DupFinder();
    dispatch(clearListWords());

    let temp = await Finder.getNextDups();
    dispatch(addListWords(temp));
  };
}
