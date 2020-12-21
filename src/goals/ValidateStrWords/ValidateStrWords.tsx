import { Goal, GoalName, GoalType } from "../../types/goals";

export class ValidateStrWords extends Goal {
  constructor() {
    super(GoalType.ValidateStrWords, GoalName.ValidateStrWords);
  }
}
