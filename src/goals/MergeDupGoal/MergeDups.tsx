import { Goal, GoalData, Tools, GoalOption } from "../../types/goals";
import { User } from "../../types/user";

//interface for component state
export interface MergeDupProps {
  goal?: Goal;
}

export class MergeDups implements Goal {
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
    this.name = "mergeDups";
    this.user = new User("", "", "");
    this.steps = steps;
    this.curNdx = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
