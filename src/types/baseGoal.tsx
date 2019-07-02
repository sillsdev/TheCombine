import { Goal, GoalData, Tools, GoalOption, GoalType } from "../types/goals";
import { User } from "./user";

export class BaseGoal implements Goal {
  goalType: GoalType;
  name: string;
  user: User;

  steps: JSX.Element[];
  curNdx: number;
  data: GoalData; // The data required to load/reload this exact goal

  tool: Tools;
  completed: boolean;
  result: GoalOption;

  constructor() {
    this.goalType = GoalType.CreateCharInv;
    this.name = "";
    this.user = new User("", "", "");
    this.steps = [];
    this.curNdx = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
