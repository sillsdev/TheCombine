import { Goal, GoalName, GoalType } from "types/goals";
import { MergeDupData, MergeStepData } from "./MergeDupsTypes";

export class MergeDups extends Goal {
  constructor(
    steps: MergeStepData[] = [],
    data: MergeDupData = { plannedWords: [[]] }
  ) {
    super(GoalType.MergeDups, GoalName.MergeDups, steps, data);
  }
}
