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

export class Goal {
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

  constructor(
    type: GoalType = GoalType.Default,
    name: string = GoalName.Default,
    steps: GoalStep[] = [],
    data: GoalData = {}
  ) {
    this.goalType = type;
    this.name = name;
    this.user = new User("", "", "");
    this.steps = steps;
    this.numSteps = 1;
    this.currentStep = 0;
    this.data = data;
    this.completed = false;
    this.result = GoalOption.Current;
    this.hash = generateGuid();
  }
}

export enum GoalType {
  Default,
  CreateCharInv,
  ValidateChars,
  CreateStrWordInv,
  ValidateStrWords,
  MergeDups,
  SpellcheckGloss,
  ReviewEntries,
  HandleFlags,
}

export enum GoalName {
  Default = "default",
  CreateCharInv = "createCharInv",
  ValidateChars = "validateChars",
  CreateStrWordInv = "createStrWordInv",
  ValidateStrWords = "validateStrWords",
  MergeDups = "mergeDups",
  SpellcheckGloss = "spellcheckGloss",
  ReviewEntries = "reviewEntries",
  HandleFlags = "handleFlags",
}

export function generateGuid(): string {
  return Math.floor(Math.random() * 9999999).toString();
}
