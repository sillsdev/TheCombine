import { Goal, GoalData, Tools, GoalOption } from "../../types/goals";
import { User } from "../../types/user";

export class CreateCharInv implements Goal {
  id: string;
  name: string;
  user: User;
  steps: JSX.Element[];
  curNdx: number;
  data: GoalData;
  tool: Tools;
  completed: boolean;
  result: GoalOption;

  constructor(steps: JSX.Element[]) {
    this.id = "-1";
    this.name = "createCharInv";
    this.user = new User("", "", 1);
    this.steps = steps;
    this.curNdx = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
