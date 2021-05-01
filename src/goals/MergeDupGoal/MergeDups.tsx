import { MergeDupData, MergeStepData } from "goals/MergeDupGoal/MergeDupsTypes";
import { Goal, GoalName, GoalType } from "types/goals";

export class MergeDups extends Goal {
  constructor(
    steps: MergeStepData[] = [],
    data: MergeDupData = { plannedWords: [[]] }
  ) {
    super(GoalType.MergeDups, GoalName.MergeDups, steps, data);
  }
}
