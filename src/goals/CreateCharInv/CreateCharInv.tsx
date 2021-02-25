import { CharacterChange } from "goals/CharInventoryCreation/CharacterInventoryActions";
import { Goal, GoalName, GoalType } from "types/goals";

export interface CreateCharInvChanges {
  charChanges: CharacterChange[];
}
export interface CreateCharInvData {
  inventory: string[][];
}
export interface CreateCharInvStepData {
  inventory: string[];
}

export class CreateCharInv extends Goal {
  constructor(
    steps: CreateCharInvStepData[] = [{ inventory: [] }],
    data: CreateCharInvData = { inventory: [[]] }
  ) {
    super(GoalType.CreateCharInv, GoalName.CreateCharInv, steps, data);
  }
}
