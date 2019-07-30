import {
  Goal,
  GoalData,
  Tools,
  GoalOption,
  GoalType,
  GoalStep,
  generateGuid
} from "../../types/goals";
import { User } from "../../types/user";

export class ReviewEntries implements Goal {
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

  constructor(steps: GoalStep[] = []) {
    this.goalType = GoalType.ReviewEntries;
    this.name = "reviewEntries";
    this.user = new User("", "", "");
    this.steps = steps;
    this.numSteps = 1;
    this.currentStep = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
    this.hash = generateGuid();
  }
}
