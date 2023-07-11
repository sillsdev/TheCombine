import { MergeSourceWord, MergeUndoIds, MergeWords, Word } from "api/models";
import { Goal, GoalName, GoalType } from "types/goals";

export interface MergeDupsData {
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

export class MergeDups extends Goal {
  constructor(
    steps: MergeStepData[] = [],
    data: MergeDupsData = { plannedWords: [[]] }
  ) {
    super(GoalType.MergeDups, GoalName.MergeDups, steps, data);
  }
}
