import {
  Goal,
  GoalData,
  Tools,
  GoalOption,
  GoalType,
  GoalStep
} from "../../types/goals";
import { User } from "../../types/user";

export class CreateCharInv implements Goal {
  goalType: GoalType;
  name: string;
  user: User;
  steps: GoalStep[];
  numSteps: number;
  curNdx: number;
  data: GoalData;
  tool: Tools;
  completed: boolean;
  result: GoalOption;

  constructor(steps: GoalStep[] = [], numSteps: number = 8) {
    this.goalType = GoalType.CreateCharInv;
    this.name = "charInventory";
    this.user = new User("", "", "");
    this.steps = steps;
    this.numSteps = numSteps;
    this.curNdx = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
