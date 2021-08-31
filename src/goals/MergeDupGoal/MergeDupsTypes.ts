import { MergeUndoIds, Word } from "api/models";

export interface MergeDupData {
  plannedWords: Word[][];
}

export interface MergeStepData {
  words: Word[];
}

export interface MergesCompleted {
  merges: MergeUndoIds[];
}
