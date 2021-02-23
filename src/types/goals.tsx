import { v4 } from "uuid";

import {
  CreateCharInvChanges,
  CreateCharInvData,
  CreateCharInvStepData,
} from "goals/CreateCharInv/CreateCharInv";
import { MergeDupData, MergeStepData } from "goals/MergeDupGoal/MergeDups";
import { User } from "types/user";

export type GoalData = CreateCharInvData | MergeDupData | {};
export type GoalStep = CreateCharInvStepData | MergeStepData | {};
export type GoalChanges = CreateCharInvChanges | {};

export interface GoalProps {
  goal?: Goal;
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

// The enum value is a permanent id for UserEdits and should not be changed.
export enum GoalType {
  Default = -1,
  CreateCharInv = 0,
  CreateStrWordInv = 2,
  HandleFlags = 7,
  MergeDups = 4,
  ReviewEntries = 6,
  SpellcheckGloss = 5,
  ValidateChars = 1,
  ValidateStrWords = 3,
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
  guid: string;
  goalType: GoalType;
  name: GoalName;
  user: User;
  steps: GoalStep[];
  numSteps: number;
  currentStep: number;
  data: GoalData;
  completed: boolean;
  changes: GoalChanges;

  constructor(
    type = GoalType.Default,
    name = GoalName.Default,
    steps: GoalStep[] = [{}],
    data: GoalData = {}
  ) {
    this.guid = v4();
    this.goalType = type;
    this.name = name;
    this.user = new User("", "", "");
    this.steps = steps;
    this.numSteps = 1;
    this.currentStep = 0;
    this.data = data;
    this.completed = false;
    this.changes = {};
  }
}
