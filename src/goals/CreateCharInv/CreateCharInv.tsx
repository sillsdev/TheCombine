import { generateGuid, Goal, GoalOption, GoalType } from "../../types/goals";
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
  completed: boolean;
  result: GoalOption;
  hash: string;

  constructor(steps: CreateCharInvStepData[] = []) {
    this.goalType = GoalType.CreateCharInv;
    this.name = "charInventory";
    this.user = new User("", "", "");
    this.steps = steps;
    this.numSteps = 1;
    this.currentStep = 0;
    this.data = { inventory: [[]] };
    this.completed = false;
    this.result = GoalOption.Current;
    this.hash = generateGuid();
  }
}
