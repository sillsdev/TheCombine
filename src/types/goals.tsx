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

export type GoalData = CreateCharInvData | MergeDupData | {}; // | OtherTypes

export type GoalStep = CreateCharInvStepData | MergeStepData; // | OtherTypes

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

// The order here must match that of the stepComponentDictionary.
export enum GoalType {
  Default,
  CreateCharInv,
  CreateStrWordInv,
  HandleFlags,
  MergeDups,
  ReviewEntries,
  SpellcheckGloss,
  ValidateChars,
  ValidateStrWords,
}

// These strings must match what is in src/resources/translations.json.
export enum GoalName {
  Default = "default",
  CreateCharInv = "charInventory",
  CreateStrWordInv = "createStrWordInv",
  HandleFlags = "handleFlags",
  MergeDups = "mergeDups",
  ReviewEntries = "reviewEntries",
  SpellcheckGloss = "spellcheckGloss",
  ValidateChars = "validateChars",
  ValidateStrWords = "validateStrWords",
}

export class Goal {
  goalType: GoalType;
  name: GoalName;
  user: User;
  steps: GoalStep[];
  numSteps: number;
  currentStep: number;
  data: GoalData;
  completed: boolean;
  result: GoalOption;
  hash: string;

  constructor(
    type = GoalType.Default,
    name = GoalName.Default,
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

export function generateGuid(): string {
  return Math.floor(Math.random() * 9999999).toString();
}
