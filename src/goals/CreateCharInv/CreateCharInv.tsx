import { Goal, GoalName, GoalType } from "types/goals";
import { CreateCharInvData, CreateCharInvStepData } from "./CreateCharInvTypes";

export class CreateCharInv extends Goal {
  constructor(
    steps: CreateCharInvStepData[] = [{ inventory: [] }],
    data: CreateCharInvData = { inventory: [[]] }
  ) {
    super(GoalType.CreateCharInv, GoalName.CreateCharInv, steps, data);
  }
}
