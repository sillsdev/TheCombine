import { Word, simpleWord } from "../../../../types/word";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../../types";
import DupFinder from "../../DuplicateFinder/DuplicateFinder";

// wordlist actions

export const ADD_LIST_WORD = "ADD_LIST_WORD";
export type ADD_LIST_WORD = typeof ADD_LIST_WORD;

export const REMOVE_LIST_WORD = "REMOVE_LIST_WORD";
export type REMOVE_LIST_WORD = typeof REMOVE_LIST_WORD;

export const CLEAR_LIST_WORDS = "CLEAR_LIST_WORDS";
export type CLEAR_LIST_WORDS = typeof CLEAR_LIST_WORDS;

export interface WordListAction {
  type: ADD_LIST_WORD | REMOVE_LIST_WORD | CLEAR_LIST_WORDS;
  payload: Word;
}

export function clearListWords(): WordListAction {
  return {
    type: CLEAR_LIST_WORDS,
    payload: simpleWord("", "")
  };
}

export function addListWord(word: Word): WordListAction {
  return {
    type: ADD_LIST_WORD,
    payload: word
  };
}

export function removeListWord(word: Word): WordListAction {
  return {
    type: REMOVE_LIST_WORD,
    payload: word
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
    temp.map(word => {
      dispatch(addListWord(word));
    });
  };
}
