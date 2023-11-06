import { Edit, Permission } from "api/models";
import { CreateCharInv } from "goals/CharacterInventory/CharacterInventoryTypes";
import { CreateStrWordInv } from "goals/CreateStrWordInv/CreateStrWordInv";
import { HandleFlags } from "goals/HandleFlags/HandleFlags";
import {
  MergeDups,
  ReviewDeferredDups,
} from "goals/MergeDuplicates/MergeDupsTypes";
import { ReviewEntries } from "goals/ReviewEntries/ReviewEntriesTypes";
import { SpellCheckGloss } from "goals/SpellCheckGloss/SpellCheckGloss";
import { ValidateChars } from "goals/ValidateChars/ValidateChars";
import { ValidateStrWords } from "goals/ValidateStrWords/ValidateStrWords";
import { Goal, GoalStatus, GoalType } from "types/goals";

export function maxNumSteps(type: GoalType): number {
  switch (type) {
    case GoalType.MergeDups:
      return 12;
    case GoalType.ReviewDeferredDups:
      return 99;
    default:
      return 1;
  }
}

/** Specify which project permission is required for a user to access a goal. */
export function requiredPermission(type: GoalType): Permission {
  switch (type) {
    case GoalType.MergeDups:
    case GoalType.ReviewDeferredDups:
    case GoalType.ReviewEntries:
      return Permission.MergeAndReviewEntries;
    case GoalType.CreateCharInv:
      return Permission.CharacterInventory;
    default:
      return Permission.Archive;
  }
}

export function goalTypeToGoal(type: GoalType): Goal {
  switch (type) {
    case GoalType.CreateCharInv:
      return new CreateCharInv();
    case GoalType.CreateStrWordInv:
      return new CreateStrWordInv();
    case GoalType.HandleFlags:
      return new HandleFlags();
    case GoalType.MergeDups:
      return new MergeDups();
    case GoalType.ReviewDeferredDups:
      return new ReviewDeferredDups();
    case GoalType.ReviewEntries:
      return new ReviewEntries();
    case GoalType.SpellCheckGloss:
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

export function convertEditToGoal(edit: Edit, index?: number): Goal {
  const goal = goalTypeToGoal(edit.goalType);
  goal.guid = edit.guid;
  goal.index = index ?? -1;
  goal.steps = edit.stepData.map((stepString) => JSON.parse(stepString));
  goal.numSteps = goal.steps.length;
  goal.changes = JSON.parse(edit.changes);
  goal.status = GoalStatus.Completed;
  return goal;
}
