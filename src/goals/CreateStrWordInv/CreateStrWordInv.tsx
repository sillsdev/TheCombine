import { Goal, GoalData, Tools, GoalOption } from "../../types/goals";
import { User } from "../../types/user";

export class CreateStrWordInv implements Goal {
  id: number;
  name: string;
  user: User;
  steps: JSX.Element[];
  curNdx: number;
  data: GoalData;
  tool: Tools;
  completed: boolean;
  result: GoalOption;

  constructor(steps: JSX.Element[]) {
    this.id = -1;
    this.name = "createStrWordInv";
    this.user = new User("", "", 1);
    this.steps = steps;
    this.curNdx = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
