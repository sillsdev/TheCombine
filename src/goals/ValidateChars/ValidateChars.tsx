import { Goal, GoalName, GoalType } from "../../types/goals";

export class ValidateChars extends Goal {
  constructor() {
    super(GoalType.ValidateChars, GoalName.ValidateChars);
  }
}
