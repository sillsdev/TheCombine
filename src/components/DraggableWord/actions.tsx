import {MergeTreeReference} from '../../goals/MergeDupGoal/MergeDupStep/MergeDupsTree';

export const DRAG_WORD = "DRAG_WORD";
export type DRAG_WORD = typeof DRAG_WORD;

export const DROP_WORD = "DROP_WORD";
export type DROP_WORD = typeof DROP_WORD;

export type DRAGGABLE_WORD_GENERIC = DRAG_WORD | DROP_WORD;

export type WordDragPayload = MergeTreeReference | undefined;

export interface WordDragAction {
  type: DRAGGABLE_WORD_GENERIC;
  payload: WordDragPayload;
}

export function dragWord(ref: MergeTreeReference): WordDragAction {
  return {
    type: DRAG_WORD,
    payload: ref
  };
}

export function dropWord(): WordDragAction {
  return {
    type: DROP_WORD,
    payload: undefined
  };
}
