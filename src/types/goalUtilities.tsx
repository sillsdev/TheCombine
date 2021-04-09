import { CreateCharInv } from "goals/CreateCharInv/CreateCharInv";
import { CreateStrWordInv } from "goals/CreateStrWordInv/CreateStrWordInv";
import { HandleFlags } from "goals/HandleFlags/HandleFlags";
import { MergeDups } from "goals/MergeDupGoal/MergeDups";
import { ReviewEntries } from "goals/ReviewEntries/ReviewEntries";
import { SpellCheckGloss } from "goals/SpellCheckGloss/SpellCheckGloss";
import { ValidateChars } from "goals/ValidateChars/ValidateChars";
import { ValidateStrWords } from "goals/ValidateStrWords/ValidateStrWords";
import { Goal, GoalStatus, GoalType } from "types/goals";
import { Edit } from "types/userEdit";

export function maxNumSteps(type: GoalType) {
  switch (type) {
    case GoalType.MergeDups:
      return 12;
    default:
      return 1;
  }
}

export function goalTypeToGoal(type: GoalType) {
  switch (type) {
    case GoalType.CreateCharInv:
      return new CreateCharInv();
    case GoalType.CreateStrWordInv:
      return new CreateStrWordInv();
    case GoalType.HandleFlags:
      return new HandleFlags();
    case GoalType.MergeDups:
      return new MergeDups();
    case GoalType.ReviewEntries:
      return new ReviewEntries();
    case GoalType.SpellcheckGloss:
      return new SpellCheckGloss();
    case GoalType.ValidateChars:
      return new ValidateChars();
    case GoalType.ValidateStrWords:
      return new ValidateStrWords();
    default:
      return new Goal();
  }
}

export function convertGoalToEdit(goal: Goal): Edit {
  const guid = goal.guid;
  const goalType = goal.goalType as number;
  const stepData = goal.steps.map((s) => JSON.stringify(s));
  const changes = JSON.stringify(goal.changes);
  return { guid, goalType, stepData, changes };
}

export function convertEditToGoal(edit: Edit): Goal {
  const goal = goalTypeToGoal(edit.goalType);
  goal.guid = edit.guid;
  goal.steps = edit.stepData.map((stepString) => JSON.parse(stepString));
  goal.numSteps = goal.steps.length;
  goal.changes = JSON.parse(edit.changes);
  goal.status = GoalStatus.Completed;
  return goal;
}
