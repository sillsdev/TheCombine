import { Word } from "../../types/word";

export const DRAG_WORD = "DRAG_WORD";
export type DRAG_WORD = typeof DRAG_WORD;

export const DROP_WORD = "DROP_WORD";
export type DROP_WORD = typeof DROP_WORD;

export interface WordDrag {
  type: DRAG_WORD | DROP_WORD;
  payload: Word | undefined;
}

export function dragWord(word: Word): WordDrag {
  return {
    type: DRAG_WORD,
    payload: word
  };
}

export function dropWord(): WordDrag {
  return {
    type: DROP_WORD,
    payload: undefined
  };
}
