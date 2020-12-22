import { Goal, GoalName, GoalType } from "../../types/goals";

export class HandleFlags extends Goal {
  constructor() {
    super(GoalType.HandleFlags, GoalName.HandleFlags);
  }
}
