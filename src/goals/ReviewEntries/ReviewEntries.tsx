import { Goal, GoalName, GoalType } from "types/goals";

export class ReviewEntries extends Goal {
  constructor() {
    super(GoalType.ReviewEntries, GoalName.ReviewEntries);
  }
}
