import { Action, PayloadAction } from "@reduxjs/toolkit";

import { MergeUndoIds, Word } from "api/models";
import * as Backend from "backend";
import { getDuplicates, getGraylistEntries } from "backend";
import { getCurrentUser, getProjectId } from "backend/localStorage";
import { CharInvChanges } from "goals/CharacterInventory/CharacterInventoryTypes";
import { dispatchMergeStepData } from "goals/MergeDuplicates/Redux/MergeDupsActions";
import {
  addCharInvChangesToGoalAction,
  addCompletedMergeToGoalAction,
  addEntryEditToGoalAction,
  incrementGoalStepAction,
  loadUserEditsAction,
  setCurrentGoalAction,
  setGoalDataAction,
  setGoalStatusAction,
  updateStepFromDataAction,
} from "goals/Redux/GoalReducer";
import { EntryEdit } from "goals/ReviewEntries/ReviewEntriesTypes";
import { type StoreState, type StoreStateDispatch } from "rootRedux/types";
import router from "router/browserRouter";
import { Goal, GoalStatus, GoalType } from "types/goals";
import { Path } from "types/path";
import { convertEditToGoal, maxNumSteps } from "utilities/goalUtilities";

// Action Creation Functions

export function addCharInvChangesToGoal(
  changes: CharInvChanges
): PayloadAction {
  return addCharInvChangesToGoalAction(changes);
}

export function addEntryEditToGoal(entryEdit: EntryEdit): PayloadAction {
  return addEntryEditToGoalAction(entryEdit);
}

export function addCompletedMergeToGoal(changes: MergeUndoIds): PayloadAction {
  return addCompletedMergeToGoalAction(changes);
}

export function incrementGoalStep(): Action {
  return incrementGoalStepAction();
}

export function loadUserEdits(history?: Goal[]): PayloadAction {
  return loadUserEditsAction(history ?? []);
}

export function setCurrentGoal(goal?: Goal): PayloadAction {
  return setCurrentGoalAction(goal ? { ...goal } : new Goal());
}

export function setGoalData(goalData: Word[][]): PayloadAction {
  return setGoalDataAction(goalData);
}

export function setGoalStatus(status: GoalStatus): PayloadAction {
  return setGoalStatusAction(status);
}

export function updateStepFromData(): Action {
  return updateStepFromDataAction();
}

// Dispatch Functions

export function asyncAddGoal(goal: Goal) {
  return async (dispatch: StoreStateDispatch) => {
    const userEditId = getUserEditId();
    if (userEditId) {
      dispatch(setCurrentGoal(goal));

      // Check if this is a new goal.
      if (goal.status !== GoalStatus.Completed) {
        await Backend.addGoalToUserEdit(userEditId, goal);
        // Load the new goal, but don't await, to allow a loading screen.
        dispatch(asyncLoadNewGoal(goal, userEditId));
      }

      // Serve goal.
      router.navigate(Path.GoalCurrent);
    }
  };
}

export function asyncAdvanceStep() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const initialStep = getState().goalsState.currentGoal.currentStep;
    dispatch(incrementGoalStep());
    if (initialStep != getState().goalsState.currentGoal.currentStep) {
      // Update data.
      dispatch(updateStepFromData());
      // Dispatch to state.
      const updatedGoal = getState().goalsState.currentGoal;
      dispatch(dispatchStepData(updatedGoal));
      // Save to database.
      await saveCurrentStep(updatedGoal);
    } else {
      goalCleanup(getState().goalsState.currentGoal);
    }
  };
}

export function asyncCreateUserEdits() {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(loadUserEdits([]));
    await Backend.createUserEdit();
  };
}

export function asyncGetUserEdits() {
  return async (dispatch: StoreStateDispatch) => {
    const projectId = getProjectId();
    if (projectId) {
      const userEditId = getUserEditId();

      if (userEditId) {
        await dispatch(asyncLoadExistingUserEdits(projectId, userEditId));
      } else {
        await dispatch(asyncCreateUserEdits());
      }
    }
  };
}

export function asyncLoadExistingUserEdits(
  projectId: string,
  userEditId: string
) {
  return async (dispatch: StoreStateDispatch) => {
    const userEdit = await Backend.getUserEditById(projectId, userEditId);
    const history = userEdit.edits.map(convertEditToGoal);
    dispatch(loadUserEdits(history));
  };
}

export function asyncLoadNewGoal(goal: Goal, userEditId: string) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    // Load data.
    dispatch(setCurrentGoal(goal));
    const currentGoal = getState().goalsState.currentGoal;
    const goalData = await loadGoalData(currentGoal.goalType);
    if (goalData.length > 0) {
      dispatch(setGoalData(goalData));
      dispatch(updateStepFromData());
      const updatedGoal = getState().goalsState.currentGoal;
      dispatch(dispatchStepData(updatedGoal));
      await Backend.addGoalToUserEdit(userEditId, updatedGoal);
      await saveCurrentStep(updatedGoal);
    }
    dispatch(setGoalStatus(GoalStatus.InProgress));
  };
}

export function asyncUpdateGoal() {
  return async (_dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const userEditId = getUserEditId();
    if (userEditId) {
      await Backend.addGoalToUserEdit(
        userEditId,
        getState().goalsState.currentGoal
      );
    }
  };
}

export function dispatchStepData(goal: Goal) {
  return (dispatch: StoreStateDispatch) => {
    switch (goal.goalType) {
      case GoalType.MergeDups:
        dispatch(dispatchMergeStepData(goal));
        break;
      case GoalType.ReviewDeferredDups:
        dispatch(dispatchMergeStepData(goal));
        break;
      default:
        break;
    }
  };
}

// Helper Functions

export function getUserEditId(): string | undefined {
  const user = getCurrentUser();
  if (user) {
    const projectId = getProjectId();
    const projectIds = Object.keys(user.workedProjects);
    const key = projectIds.find((id) => id === projectId);
    if (key) {
      return user.workedProjects[key];
    }
  }
  return undefined;
}

function goalCleanup(goal: Goal): void {
  switch (goal.goalType) {
    case GoalType.MergeDups:
      router.navigate(Path.GoalNext);
      break;
    default:
      router.navigate(Path.Goals);
      break;
  }
}

/** Returns goal data for some goal types. */
export async function loadGoalData(goalType: GoalType): Promise<Word[][]> {
  switch (goalType) {
    case GoalType.MergeDups:
      return checkMergeData(await getDuplicates(5, maxNumSteps(goalType)));
    case GoalType.ReviewDeferredDups:
      return checkMergeData(await getGraylistEntries(maxNumSteps(goalType)));
    default:
      return [];
  }
}

/** Emergency failsafe for bad merge sets. */
function checkMergeData(goalData: Word[][]): Word[][] {
  return goalData.filter((dups) => {
    const errors: string[] = [];
    if (dups.length < 2) {
      errors.push("Set of duplicates doesn't have at least 2 words!");
    }
    const wordGuids = dups.map((w) => w.guid);
    if (new Set(wordGuids).size < wordGuids.length) {
      errors.push("Set of duplicates has multiple words with the same guid!");
    }
    if (dups.some((w) => !w.senses.length)) {
      errors.push("Set of duplicates has a word with no senses!");
    }
    const senseGuids = dups.flatMap((w) => w.senses.map((s) => s.guid));
    if (new Set(senseGuids).size < senseGuids.length) {
      errors.push("Set of duplicates has multiple senses with the same guid!");
    }
    if (errors.length) {
      errors.forEach((e) => {
        console.error(e);
        alert(e);
      });
      console.error(dups);
      return false; // Skip bad merge set.
    }
    return true; // Include good merge set.
  });
}

async function saveCurrentStep(goal: Goal): Promise<void> {
  const userEditId = getUserEditId();
  if (userEditId) {
    const step = goal.steps[goal.currentStep];
    await Backend.addStepToGoal(userEditId, goal.guid, step, goal.currentStep);
  }
}
