import { Goal, GoalName, GoalType } from "../../types/goals";
import { Word } from "../../types/word";

export interface MergeDupData {
  plannedWords: Word[][];
}

export interface MergeStepData {
  words: Word[];
}

export class MergeDups extends Goal {
  constructor(
    steps: MergeStepData[] = [],
    data: MergeDupData = { plannedWords: [[]] }
  ) {
    super(GoalType.MergeDups, GoalName.MergeDups, steps, data);
  }
}
