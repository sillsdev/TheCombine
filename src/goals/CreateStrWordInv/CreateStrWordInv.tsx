import { Goal, GoalName, GoalType } from "../../types/goals";

export class CreateStrWordInv extends Goal {
  constructor() {
    super(GoalType.CreateStrWordInv, GoalName.CreateStrWordInv);
  }
}
