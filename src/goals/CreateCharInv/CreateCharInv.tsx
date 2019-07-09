import { Goal, Tools, GoalOption, GoalType } from "../../types/goals";
import { User } from "../../types/user";

export interface CreateCharInvData {
  inventory: string[][];
}

export interface CreateCharInvStepData {
  inventory: string[];
}

export class CreateCharInv implements Goal {
  goalType: GoalType;
  name: string;
  user: User;
  steps: CreateCharInvStepData[];
  numSteps: number;
  currentStep: number;
  data: CreateCharInvData;
  tool: Tools;
  completed: boolean;
  result: GoalOption;

  constructor(steps: CreateCharInvStepData[] = [], numSteps: number = 8) {
    this.goalType = GoalType.CreateCharInv;
    this.name = "charInventory";
    this.user = new User("", "", "");
    this.steps = steps;
    this.numSteps = numSteps;
    this.currentStep = 0;
    this.data = { inventory: [] };
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
