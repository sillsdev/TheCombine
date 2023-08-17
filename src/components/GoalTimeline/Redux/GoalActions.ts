import { Action, PayloadAction } from "@reduxjs/toolkit";

import { MergeUndoIds, Word } from "api/models";
import * as Backend from "backend";
import { getCurrentUser, getProjectId } from "backend/localStorage";
import router from "browserRouter";
import {
  addCharInvChangesToGoalAction,
  addCompletedMergeToGoalAction,
  incrementGoalStepAction,
  loadUserEditsAction,
  setCurrentGoalAction,
  setGoalDataAction,
  setGoalStatusAction,
  updateStepFromDataAction,
} from "components/GoalTimeline/Redux/GoalReducer";
import { CharacterChange } from "goals/CharacterInventory/CharacterInventoryTypes";
import {
  dispatchMergeStepData,
  fetchMergeDupsData,
} from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { Goal, GoalStatus, GoalType } from "types/goals";
import { Path } from "types/path";
import { convertEditToGoal } from "utilities/goalUtilities";

// Action Creation Functions

export function addCharInvChangesToGoal(
  charChanges: CharacterChange[]
): PayloadAction {
  return addCharInvChangesToGoalAction(charChanges);
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
      if (goal.index === -1) {
        const newIndex = await Backend.addGoalToUserEdit(userEditId, goal);
        // Load the new goal, but don't await, to allow a loading screen.
        dispatch(asyncLoadNewGoal({ ...goal, index: newIndex }, userEditId));
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
    const history = userEdit.edits.map((e, index) => {
      return convertEditToGoal(e, index);
    });
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

// Returns goal data if the goal is MergeDups.
export async function loadGoalData(goalType: GoalType): Promise<Word[][]> {
  switch (goalType) {
    case GoalType.MergeDups:
      return await fetchMergeDupsData(goalType);
    default:
      return [];
  }
}

async function saveCurrentStep(goal: Goal) {
  const userEditId = getUserEditId();
  if (userEditId) {
    const step = goal.steps[goal.currentStep];
    await Backend.addStepToGoal(userEditId, goal.index, step, goal.currentStep);
  }
}
