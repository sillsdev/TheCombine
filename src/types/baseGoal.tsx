import {
  Goal,
  GoalData,
  Tools,
  GoalOption,
  GoalType,
  GoalStep,
  generateGuid
} from "../types/goals";
import { User } from "./user";

export class BaseGoal implements Goal {
  goalType: GoalType;
  name: string;
  user: User;

  steps: GoalStep[];
  numSteps: number;
  currentStep: number;
  data: GoalData; // The data required to load/reload this exact goal

  tool: Tools;
  completed: boolean;
  result: GoalOption;
  hash: string;

  constructor(numSteps: number = 8) {
    this.goalType = GoalType.CreateCharInv;
    this.name = "";
    this.user = new User("", "", "");
    this.steps = [];
    this.numSteps = numSteps;
    this.currentStep = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
    this.hash = generateGuid();
  }
}
