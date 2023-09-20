import { v4 } from "uuid";

import { User } from "api/models";
import {
  CharInvChanges,
  CharInvData,
  CharInvStepData,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import {
  MergeDupsData,
  MergeStepData,
  MergesCompleted,
} from "goals/MergeDuplicates/MergeDupsTypes";
import { newUser } from "types/user";

export type GoalData = CharInvData | MergeDupsData;
export type GoalStep = CharInvStepData | MergeStepData | {};
export type GoalChanges = CharInvChanges | MergesCompleted;

export interface GoalProps {
  goal?: Goal;
}

// The representation of goals in the redux store
export interface GoalsState {
  allGoalTypes: GoalType[];
  currentGoal: Goal;
  goalTypeSuggestions: GoalType[];
  history: Goal[];
  previousGoalType: GoalType;
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
  ReviewDeferredDups = 8,
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
  ReviewDeferredDups = "ReviewDeferredDups",
}

export enum GoalStatus {
  Loading = "LOADING",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
}

export class Goal {
  guid: string;
  goalType: GoalType;
  index: number;
  name: GoalName;
  user: User;
  steps: GoalStep[];
  numSteps: number;
  currentStep: number;
  data?: GoalData;
  status: GoalStatus;
  changes?: GoalChanges;

  constructor(
    type = GoalType.Default,
    name = GoalName.Default,
    steps: GoalStep[] = [{}],
    data?: GoalData
  ) {
    this.guid = v4();
    this.goalType = type;
    this.index = -1;
    this.name = name;
    this.user = newUser();
    this.steps = steps;
    this.numSteps = 1;
    this.currentStep = 0;
    this.data = data;
    this.status = GoalStatus.Loading;
  }
}
