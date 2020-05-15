import {
  Goal,
  GoalData,
  Tools,
  GoalOption,
  GoalType,
  GoalStep,
  generateGuid,
} from "../../types/goals";
import { User } from "../../types/user";

export class ValidateStrWords implements Goal {
  goalType: GoalType;
  name: string;
  user: User;
  steps: GoalStep[];
  numSteps: number;
  currentStep: number;
  data: GoalData;
  tool: Tools;
  completed: boolean;
  result: GoalOption;
  hash: string;

  constructor(steps: GoalStep[] = [], numSteps: number = 8) {
    this.goalType = GoalType.ValidateStrWords;
    this.name = "validateStrWords";
    this.user = new User("", "", "");
    this.steps = steps;
    this.numSteps = numSteps;
    this.currentStep = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
    this.hash = generateGuid();
  }
}
