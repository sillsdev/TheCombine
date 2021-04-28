import { Word } from "types/word";

export interface CompletedMerge {
  childrenIds: string[];
  parentIds: string[];
}

export interface MergeDupData {
  plannedWords: Word[][];
}

export interface MergeStepData {
  words: Word[];
}

export interface MergesCompleted {
  merges: CompletedMerge[];
}
