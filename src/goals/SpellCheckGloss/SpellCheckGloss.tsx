import { Goal, GoalName, GoalType } from "../../types/goals";

export class SpellCheckGloss extends Goal {
  constructor() {
    super(GoalType.SpellcheckGloss, GoalName.SpellcheckGloss);
  }
}
