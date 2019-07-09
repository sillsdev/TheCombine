import { Goal, Tools, GoalOption, GoalType, GoalStep } from "../../types/goals";
import { User } from "../../types/user";
import { Word } from "../../types/word";

//interface for component state
export interface MergeDupProps {
  goal?: Goal;
}

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
  tool: Tools;
  completed: boolean;
  result: GoalOption;

  constructor(steps: MergeStepData[] = [], numSteps: number = 8) {
    this.goalType = GoalType.MergeDups;
    this.name = "mergeDups";
    this.user = new User("", "", "");
    this.steps = steps;
    this.numSteps = numSteps;
    this.currentStep = 0;
    this.data = { plannedWords: [[]] };
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
