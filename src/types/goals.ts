import { v4 } from "uuid";

import {
  type CharInvChanges,
  type CharInvData,
  type CharInvStepData,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import {
  type MergeDupsData,
  type MergeStepData,
  type MergesCompleted,
} from "goals/MergeDuplicates/MergeDupsTypes";
import { type EntriesEdited } from "goals/ReviewEntries/ReviewEntriesTypes";

export type GoalData = CharInvData | MergeDupsData;
// Record<string, never> is the recommended type for an empty object.
export type GoalStep = CharInvStepData | MergeStepData | Record<string, never>;
export type GoalChanges = CharInvChanges | EntriesEdited | MergesCompleted;

export interface GoalProps {
  goal?: Goal;
}

// The enum value is a permanent id for UserEdits and should not be changed.
export enum GoalType {
  Default = -1,
  CreateCharInv = 0,
  CreateStrWordInv = 2,
  HandleFlags = 7,
  MergeDups = 4,
  ReviewDeferredDups = 8,
  ReviewEntries = 6,
  SpellCheckGloss = 5,
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
  ReviewDeferredDups = "reviewDeferredDups",
  ReviewEntries = "reviewEntries",
  SpellCheckGloss = "spellCheckGloss",
  ValidateChars = "validateChars",
  ValidateStrWords = "validateStrWords",
}

export enum GoalStatus {
  Loading = "LOADING",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
}

export class Goal {
  guid: string;
  goalType: GoalType;
  name: GoalName;
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
    this.name = name;
    this.steps = steps;
    this.numSteps = 1;
    this.currentStep = 0;
    this.data = data;
    this.status = GoalStatus.Loading;
  }
}
