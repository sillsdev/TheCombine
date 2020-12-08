import {
  CreateCharInvData,
  CreateCharInvStepData,
} from "../goals/CreateCharInv/CreateCharInv";
import { MergeDupData, MergeStepData } from "../goals/MergeDupGoal/MergeDups";
import { User } from "./user";

export enum GoalOption {
  Complete,
  Abandon,
  Current,
}

export type GoalData = MergeDupData | CreateCharInvData | {}; // | OtherTypes

export type MockGoalStepType = {};

export type GoalStep = MergeStepData | CreateCharInvStepData; // | OtherTypes

export interface GoalProps {
  goal?: Goal;
}

export interface GoalViewState {
  state: GoalsState;
}

// The representation of goals in the redux store
export interface GoalsState {
  historyState: GoalHistoryState;
  allPossibleGoals: Goal[];
  suggestionsState: GoalSuggestionsState;
}

export interface GoalHistoryState {
  history: Goal[];
}

export interface GoalSuggestionsState {
  suggestions: Goal[];
}

export interface GoalSwitcherState {
  goals: Goal[];
}

export interface GoalSelectorState {
  selectedIndex: number;
  allPossibleGoals: Goal[];
  mouseX: number;
  lastIndex: number;
}

export interface Goal {
  goalType: GoalType;
  name: string;
  user: User;
  steps: GoalStep[];
  numSteps: number;
  currentStep: number;
  data: GoalData; // The data required to load/reload this exact goal
  completed: boolean;
  result: GoalOption;
  hash: string;
}

export enum GoalType {
  CreateCharInv,
  ValidateChars,
  CreateStrWordInv,
  ValidateStrWords,
  MergeDups,
  SpellcheckGloss,
  ReviewEntries,
  HandleFlags,
}

export function generateGuid(): string {
  return Math.floor(Math.random() * 9999999).toString();
}
