import * as Backend from "backend";
import * as LocalStorage from "backend/localStorage";
import history, { Path } from "browserHistory";
import { MergeDupData } from "goals/MergeDupGoal/MergeDups";
import {
  dispatchMergeStepData,
  loadMergeDupsData,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import { StoreState } from "types";
import { ActionWithPayload, StoreStateDispatch } from "types/actions";
import { Goal, GoalStatus, GoalType } from "types/goals";
import { convertEditToGoal } from "types/goalUtilities";

export enum GoalsActions {
  ADD_GOAL_TO_HISTORY = "ADD_GOAL_TO_HISTORY",
  LOAD_USER_EDITS = "LOAD_USER_EDITS",
  SET_CURRENT_GOAL = "SET_CURRENT_GOAL",
  UPDATE_GOAL = "UPDATE_GOAL",
}

export type GoalAction =
  | AddGoalToHistoryAction
  | LoadUserEditsAction
  | SetCurrentGoalAction
  | UpdateGoalAction;

// Action Creators

export interface AddGoalToHistoryAction extends ActionWithPayload<Goal> {
  type: GoalsActions.ADD_GOAL_TO_HISTORY;
  payload: Goal;
}

export interface LoadUserEditsAction extends ActionWithPayload<Goal[]> {
  type: GoalsActions.LOAD_USER_EDITS;
  payload: Goal[];
}

export interface SetCurrentGoalAction extends ActionWithPayload<Goal> {
  type: GoalsActions.SET_CURRENT_GOAL;
  payload: Goal;
}

export interface UpdateGoalAction extends ActionWithPayload<Goal> {
  type: GoalsActions.UPDATE_GOAL;
  payload: Goal;
}

export function addGoalToHistory(goal: Goal): AddGoalToHistoryAction {
  return { type: GoalsActions.ADD_GOAL_TO_HISTORY, payload: goal };
}

export function loadUserEdits(history: Goal[]): LoadUserEditsAction {
  return { type: GoalsActions.LOAD_USER_EDITS, payload: history };
}

export function setCurrentGoal(goal?: Goal): SetCurrentGoalAction {
  return { type: GoalsActions.SET_CURRENT_GOAL, payload: goal ?? new Goal() };
}

export function updateGoal(goal: Goal): UpdateGoalAction {
  return { type: GoalsActions.UPDATE_GOAL, payload: goal };
}

// Dispatch Functions

export function asyncCreateUserEdits() {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(loadUserEdits([]));
    await Backend.createUserEdit();
  };
}

export function asyncLoadExistingUserEdits(
  projectId: string,
  userEditId: string
) {
  return async (dispatch: StoreStateDispatch) => {
    const userEdit = await Backend.getUserEditById(projectId, userEditId);
    const history = userEdit.edits.map((e) => convertEditToGoal(e));
    dispatch(loadUserEdits(history));
  };
}

export function asyncGetUserEdits() {
  return async (dispatch: StoreStateDispatch) => {
    const projectId = LocalStorage.getProjectId();
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

export function asyncAddGoalToHistory(goal: Goal) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const userEditId = getUserEditId();
    if (userEditId) {
      const goalHistory = getState().goalsState.history;
      let goalIndex = goalHistory.findIndex((g) => g.guid === goal.guid);
      if (goalIndex === -1) {
        // Add goal with .state=GoalState.Loading.
        dispatch(addGoalToHistory(goal));
        goalIndex = await Backend.addGoalToUserEdit(userEditId, goal);

        // Load the new goal, but don't await, to allow a loading screen.
        dispatch(asyncLoadNewGoal(goal, goalIndex, userEditId));
      } else {
        dispatch(setCurrentGoal(goal));
      }

      // Serve goal.
      history.push(`${Path.Goals}/${goalIndex}`);
    }
  };
}

export function asyncLoadNewGoal(
  goal: Goal,
  goalIndex: number,
  userEditId: string
) {
  return async (dispatch: StoreStateDispatch) => {
    // Load data.
    if (await loadGoalData(goal)) {
      updateStepFromData(goal);
      dispatch(dispatchStepData(goal));
      await Backend.addGoalToUserEdit(userEditId, goal);
      await saveCurrentStep(goal, goalIndex);
    }

    goal.status = GoalStatus.InProgress;
    dispatch(updateGoal(goal));
  };
}

export function asyncAdvanceStep() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const goalsState = getState().goalsState;
    let goal = goalsState.currentGoal;
    const goalHistory = goalsState.history;
    const goalIndex = goalHistory.findIndex((g) => g.guid === goal.guid);
    goal.currentStep++;
    if (goal.currentStep < goal.numSteps) {
      // Update data.
      updateStepFromData(goal);

      // Dispatch to state.
      dispatch(dispatchStepData(goal));
      dispatch(updateGoal(goal));

      // Save to database.
      await saveCurrentStep(goal, goalIndex);
    } else {
      goal.status = GoalStatus.Completed;
      dispatch(updateGoal(goal));
      history.push(Path.Goals);
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

export function asyncUpdateOrAddGoal(goal: Goal) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const userEditId = getUserEditId();
    if (userEditId) {
      const goalHistory = getState().goalsState.history;
      let goalIndex = goalHistory.findIndex((g) => g.guid === goal.guid);
      if (goalIndex === -1) {
        dispatch(addGoalToHistory(goal));
      } else {
        dispatch(updateGoal(goal));
      }
      await Backend.addGoalToUserEdit(userEditId, goal);
    }
  };
}

// Helper Funtions

// Returns true if input goal updated.
export async function loadGoalData(goal: Goal): Promise<boolean> {
  switch (goal.goalType) {
    case GoalType.MergeDups: {
      await loadMergeDupsData(goal);
      return true;
    }
  }
  return false;
}

// Returns true if input goal updated.
export function updateStepFromData(goal: Goal): boolean {
  switch (goal.goalType) {
    case GoalType.MergeDups: {
      const currentGoalData = goal.data as MergeDupData;
      goal.steps[goal.currentStep] = {
        words: currentGoalData.plannedWords[goal.currentStep],
      };
      return true;
    }
  }
  return false;
}

export function getUserEditId(): string | undefined {
  const user = LocalStorage.getCurrentUser();
  if (user) {
    const projectId = LocalStorage.getProjectId();
    const projectIds = Object.keys(user.workedProjects);
    const key = projectIds.find((id) => id === projectId);
    if (key) {
      return user.workedProjects[key];
    }
  }
  return undefined;
}

async function saveCurrentStep(goal: Goal, goalIndex: number) {
  const userEditId = getUserEditId();
  if (userEditId) {
    const step = goal.steps[goal.currentStep] ?? {};
    await Backend.addStepToGoal(userEditId, goalIndex, step, goal.currentStep);
  }
}
