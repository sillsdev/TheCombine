import { Abc, Layers, LayersOutlined, ManageSearch } from "@mui/icons-material";
import { Icon, SxProps } from "@mui/material";
import { ReactElement } from "react";

import { Edit, Permission } from "api/models";
import {
  CharInvChanges,
  CreateCharInv,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import { CreateStrWordInv } from "goals/CreateStrWordInv/CreateStrWordInv";
import { HandleFlags } from "goals/HandleFlags/HandleFlags";
import {
  MergeDups,
  MergesCompleted,
  ReviewDeferredDups,
} from "goals/MergeDuplicates/MergeDupsTypes";
import {
  EntriesEdited,
  ReviewEntries,
} from "goals/ReviewEntries/ReviewEntriesTypes";
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

export function hasChanges(g: Goal): boolean {
  if (!g.changes) {
    return false;
  }
  switch (g.name) {
    case GoalName.CreateCharInv:
      const cic = g.changes as CharInvChanges;
      return cic.charChanges?.length > 0 || cic.wordChanges?.length > 0;
    case GoalName.MergeDups:
    case GoalName.ReviewDeferredDups:
      const mc = g.changes as MergesCompleted;
      return mc.merges?.length > 0;
    case GoalName.ReviewEntries:
      const ee = g.changes as EntriesEdited;
      return ee.entryEdits?.length > 0;
    default:
      return false;
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

export function goalNameToIcon(
  name: GoalName,
  sx: SxProps = { fontSize: "inherit" }
): ReactElement {
  switch (name) {
    case GoalName.CreateCharInv:
      return <Abc sx={sx} />;
    case GoalName.MergeDups:
      return <Layers sx={sx} />;
    case GoalName.ReviewDeferredDups:
      return <LayersOutlined sx={sx} />;
    case GoalName.ReviewEntries:
      return <ManageSearch sx={sx} />;
    default:
      return <Icon sx={sx} />;
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
  const { guid, modified } = goal;
  const goalType = goal.goalType as number;
  const stepData = goal.steps.map((s) => JSON.stringify(s));
  const changes = JSON.stringify(goal.changes);
  return { guid, goalType, stepData, changes, modified };
}

export function convertEditToGoal(edit: Edit): Goal {
  const steps = edit.stepData.map((s) => JSON.parse(s));
  return {
    ...goalTypeToGoal(edit.goalType),
    changes: JSON.parse(edit.changes),
    guid: edit.guid,
    modified: edit.modified ?? undefined,
    numSteps: steps.length,
    status: GoalStatus.Completed,
    steps,
  };
}
