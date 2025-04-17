import { Action, PayloadAction } from "@reduxjs/toolkit";

import { MergeUndoIds, Word } from "api/models";
import * as Backend from "backend";
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
  setDataLoadStatusAction,
  setGoalDataAction,
  setGoalStatusAction,
  updateStepFromDataAction,
} from "goals/Redux/GoalReducer";
import { DataLoadStatus } from "goals/Redux/GoalReduxTypes";
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

export function setDataLoadStatus(status: DataLoadStatus): PayloadAction {
  return setDataLoadStatusAction(status);
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
        dispatch(setCurrentGoal(goal));
        if (await dispatch(asyncIsGoalDataReady(goal))) {
          // Load the goal data, but don't await, to allow a loading screen.
          await dispatch(asyncLoadNewGoalData());
        }
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

/** Return a bool to indicate either (true) the goal data loading can proceed,
 * or (false) stop and wait for a signal to trigger data loading. */
function asyncIsGoalDataReady(goal: Goal) {
  return async (dispatch: StoreStateDispatch): Promise<boolean> => {
    if (goal.goalType === GoalType.MergeDups) {
      dispatch(setDataLoadStatus(DataLoadStatus.Loading));
      await Backend.findDuplicates(5, maxNumSteps(goal.goalType));
      return false;
    }
    return true;
  };
}

export function asyncLoadNewGoalData() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const currentGoal = getState().goalsState.currentGoal;
    const goalData = await loadGoalData(currentGoal.goalType).catch(() => {
      dispatch(setDataLoadStatus(DataLoadStatus.Failure));
      alert("Failed to load data.");
      router.navigate(Path.Goals);
    });
    if (!goalData) {
      return;
    }
    if (goalData.length > 0) {
      dispatch(setGoalData(goalData));
      dispatch(updateStepFromData());
      const updatedGoal = getState().goalsState.currentGoal;
      dispatch(dispatchStepData(updatedGoal));
      await Backend.addGoalToUserEdit(getUserEditId()!, updatedGoal);
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
async function loadGoalData(goalType: GoalType): Promise<Word[][]> {
  switch (goalType) {
    case GoalType.MergeDups:
      const dups = await Backend.retrieveDuplicates().catch(() => {});
      return dups ? checkMergeData(dups) : Promise.reject();
    case GoalType.ReviewDeferredDups:
      return checkMergeData(
        await Backend.getGraylistEntries(maxNumSteps(goalType))
      );
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
      if (dups.length > 1) {
        Backend.blacklistAdd(dups.map((w) => w.id));
      }
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
