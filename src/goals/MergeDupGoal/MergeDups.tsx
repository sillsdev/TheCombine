import { generateGuid, Goal, GoalOption, GoalType } from "../../types/goals";
import { User } from "../../types/user";
import { Word } from "../../types/word";

//interfaces for component state
export interface MergeDupData {
  plannedWords: Word[][];
}
export interface MergeStepData {
  words: Word[];
}

export class MergeDups implements Goal {
  goalType: GoalType;
  name: string;
  user: User;
  steps: MergeStepData[];
  numSteps: number;
  currentStep: number;
  data: MergeDupData;
  completed: boolean;
  result: GoalOption;
  hash: string;

  constructor(steps: MergeStepData[] = [], numSteps: number = 8) {
    this.goalType = GoalType.MergeDups;
    this.name = "mergeDups";
    this.user = new User("", "", "");
    this.steps = steps;
    this.numSteps = numSteps;
    this.currentStep = 0;
    this.data = { plannedWords: [[]] };
    this.completed = false;
    this.result = GoalOption.Current;
    this.hash = generateGuid();
  }
}
