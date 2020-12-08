import {
  generateGuid,
  Goal,
  GoalData,
  GoalOption,
  GoalStep,
  GoalType,
} from "../../types/goals";
import { User } from "../../types/user";

export class HandleFlags implements Goal {
  goalType: GoalType;
  name: string;
  user: User;
  steps: GoalStep[];
  numSteps: number;
  currentStep: number;
  data: GoalData;
  completed: boolean;
  result: GoalOption;
  hash: string;

  constructor(steps: GoalStep[] = [], numSteps: number = 8) {
    this.goalType = GoalType.HandleFlags;
    this.name = "handleFlags";
    this.user = new User("", "", "");
    this.steps = steps;
    this.numSteps = numSteps;
    this.currentStep = 0;
    this.data = {};
    this.completed = false;
    this.result = GoalOption.Current;
    this.hash = generateGuid();
  }
}
