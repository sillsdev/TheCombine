import { CharacterChange } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";

export interface CreateCharInvChanges {
  charChanges: CharacterChange[];
}

export interface CreateCharInvData {
  inventory: string[][];
}

export interface CreateCharInvStepData {
  inventory: string[];
}
