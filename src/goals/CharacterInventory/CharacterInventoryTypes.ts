import { Goal, GoalName, GoalType } from "types/goals";
import { type Hash } from "types/hash";

export class CreateCharInv extends Goal {
  constructor(
    steps: CharInvStepData[] = [{ inventory: [] }],
    data: CharInvData = { inventory: [[]] }
  ) {
    super(GoalType.CreateCharInv, GoalName.CreateCharInv, steps, data);
  }
}

export enum CharacterStatus {
  Accepted = "accepted",
  Rejected = "rejected",
  Undecided = "undecided",
}

export type CharacterChange = [string, CharacterStatus, CharacterStatus];

export interface CharInvChanges {
  charChanges: CharacterChange[];
  wordChanges: Hash<string>;
}

export const defaultCharInvChanges: CharInvChanges = {
  charChanges: [],
  wordChanges: {},
};

export interface CharInvData {
  inventory: string[][];
}

// CharInvStepData's inventory is unused, but is present in the database,
// so cannot be removed from frontend code without a database update.
export interface CharInvStepData {
  inventory: string[];
}
