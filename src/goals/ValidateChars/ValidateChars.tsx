import { Goal, GoalData, Tools, GoalOption, GoalType } from "../../types/goals";
import { User } from "../../types/user";

export class ValidateChars implements Goal {
  goalType: GoalType;
  name: string;
  user: User;
  steps: JSX.Element[];
  curNdx: number;
  data: GoalData;
  tool: Tools;
  completed: boolean;
  result: GoalOption;

  constructor(steps: JSX.Element[]) {
    this.goalType = GoalType.ValidateChars;
    this.name = "validateChars";
    this.user = new User("", "", "");
    this.steps = steps;
    this.curNdx = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
