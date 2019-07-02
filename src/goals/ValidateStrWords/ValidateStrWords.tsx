import {
  Goal,
  GoalData,
  Tools,
  GoalOption,
  GoalType,
  GoalStep
} from "../../types/goals";
import { User } from "../../types/user";

export class ValidateStrWords implements Goal {
  goalType: GoalType;
  name: string;
  user: User;
  steps: GoalStep[];
  curNdx: number;
  data: GoalData;
  tool: Tools;
  completed: boolean;
  result: GoalOption;

  constructor(steps: GoalStep[]) {
    this.goalType = GoalType.ValidateStrWords;
    this.name = "validateStrWords";
    this.user = new User("", "", "");
    this.steps = steps;
    this.curNdx = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
