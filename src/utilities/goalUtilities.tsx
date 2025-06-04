import { Abc, Layers, LayersOutlined, ManageSearch } from "@mui/icons-material";
import { Icon } from "@mui/material";
import { ReactElement } from "react";

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
import { Goal, GoalName, GoalStatus, GoalType } from "types/goals";

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
export function requiredPermission(type: GoalName): Permission {
  switch (type) {
    case GoalName.MergeDups:
    case GoalName.ReviewDeferredDups:
    case GoalName.ReviewEntries:
      return Permission.MergeAndReviewEntries;
    case GoalName.CreateCharInv:
      return Permission.CharacterInventory;
    default:
      return Permission.Archive;
  }
}

const goalNameToGoalMap: Record<GoalName, () => Goal> = {
  [GoalName.CreateCharInv]: () => new CreateCharInv(),
  [GoalName.CreateStrWordInv]: () => new CreateStrWordInv(),
  [GoalName.HandleFlags]: () => new HandleFlags(),
  [GoalName.MergeDups]: () => new MergeDups(),
  [GoalName.ReviewDeferredDups]: () => new ReviewDeferredDups(),
  [GoalName.ReviewEntries]: () => new ReviewEntries(),
  [GoalName.SpellCheckGloss]: () => new SpellCheckGloss(),
  [GoalName.ValidateChars]: () => new ValidateChars(),
  [GoalName.ValidateStrWords]: () => new ValidateStrWords(),
  [GoalName.Default]: () => new Goal(),
};

export function goalNameToGoal(name: GoalName): Goal {
  return goalNameToGoalMap[name]();
}

export function goalNameToIcon(name: GoalName): ReactElement {
  switch (name) {
    case GoalName.CreateCharInv:
      return <Abc sx={{ fontSize: "inherit" }} />;
    case GoalName.MergeDups:
      return <Layers sx={{ fontSize: "inherit" }} />;
    case GoalName.ReviewDeferredDups:
      return <LayersOutlined sx={{ fontSize: "inherit" }} />;
    case GoalName.ReviewEntries:
      return <ManageSearch sx={{ fontSize: "inherit" }} />;
    default:
      return <Icon sx={{ fontSize: "inherit" }} />;
  }
}

const goalTypeToGoalMap: Record<GoalType, () => Goal> = {
  [GoalType.CreateCharInv]: () => new CreateCharInv(),
  [GoalType.CreateStrWordInv]: () => new CreateStrWordInv(),
  [GoalType.HandleFlags]: () => new HandleFlags(),
  [GoalType.MergeDups]: () => new MergeDups(),
  [GoalType.ReviewDeferredDups]: () => new ReviewDeferredDups(),
  [GoalType.ReviewEntries]: () => new ReviewEntries(),
  [GoalType.SpellCheckGloss]: () => new SpellCheckGloss(),
  [GoalType.ValidateChars]: () => new ValidateChars(),
  [GoalType.ValidateStrWords]: () => new ValidateStrWords(),
  [GoalType.Default]: () => new Goal(),
};

function goalTypeToGoal(type: GoalType): Goal {
  return goalTypeToGoalMap[type]();
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
