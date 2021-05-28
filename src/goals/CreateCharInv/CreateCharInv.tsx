import {
  CreateCharInvData,
  CreateCharInvStepData,
} from "goals/CreateCharInv/CreateCharInvTypes";
import { Goal, GoalName, GoalType } from "types/goals";

export class CreateCharInv extends Goal {
  constructor(
    steps: CreateCharInvStepData[] = [{ inventory: [] }],
    data: CreateCharInvData = { inventory: [[]] }
  ) {
    super(GoalType.CreateCharInv, GoalName.CreateCharInv, steps, data);
  }
}
