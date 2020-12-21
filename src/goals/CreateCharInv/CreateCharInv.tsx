import { Goal, GoalName, GoalType } from "../../types/goals";

export interface CreateCharInvData {
  inventory: string[][];
}

export interface CreateCharInvStepData {
  inventory: string[];
}

export class CreateCharInv extends Goal {
  constructor(
    steps: CreateCharInvStepData[] = [],
    data: CreateCharInvData = { inventory: [[]] }
  ) {
    super(GoalType.CreateCharInv, GoalName.CreateCharInv, steps, data);
  }
}
