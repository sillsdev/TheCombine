import { MergeSourceWord, MergeUndoIds, MergeWords, Word } from "api/models";

export interface MergeDupData {
  plannedWords: Word[][];
}

export interface MergeStepData {
  words: Word[];
}

export interface MergesCompleted {
  merges: MergeUndoIds[];
}

export function newMergeWords(
  parent: Word,
  children: MergeSourceWord[],
  deleteOnly = false
): MergeWords {
  return { parent, children, deleteOnly };
}
