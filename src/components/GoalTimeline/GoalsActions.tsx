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
import { Goal, GoalType } from "types/goals";
import { convertEditToGoal } from "types/goalUtilities";

export enum GoalsActions {
  LOAD_USER_EDITS = "LOAD_USER_EDITS",
  ADD_GOAL_TO_HISTORY = "ADD_GOAL_TO_HISTORY",
  UPDATE_GOAL = "UPDATE_GOAL",
}

export type GoalAction =
  | LoadUserEditsAction
  | AddGoalToHistoryAction
  | UpdateGoalAction;

// Action Creators

export interface LoadUserEditsAction extends ActionWithPayload<Goal[]> {
  type: GoalsActions.LOAD_USER_EDITS;
  payload: Goal[];
}

export interface AddGoalToHistoryAction extends ActionWithPayload<Goal> {
  type: GoalsActions.ADD_GOAL_TO_HISTORY;
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
  return async (dispatch: StoreStateDispatch) => {
    const userEditId = getUserEditId();
    if (userEditId) {
      // Load data.
      goal = await loadGoalData(goal);
      goal = updateStepFromData(goal);

      // Dispatch to state.
      dispatch(dispatchStepData(goal));
      dispatch(addGoalToHistory(goal));

      // Save to database.
      const goalIndex = await Backend.addGoalToUserEdit(userEditId, goal);
      await saveCurrentStep(goal, goalIndex);

      // Serve goal.
      history.push(`${Path.Goals}/${goalIndex}`);
    }
  };
}

export function asyncAdvanceStep(goal?: Goal) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const goalHistory = getState().goalsState.historyState.history;
    let goalIndex: number;
    if (goal !== undefined) {
      goalIndex = goalHistory.findIndex((g) => g.guid === goal!.guid);
    } else {
      goalIndex = goalHistory.length - 1;
      goal = goalHistory[goalIndex];
    }
    goal.currentStep++;
    if (goal.currentStep < goal.numSteps) {
      // Update data.
      goal = updateStepFromData(goal);

      // Dispatch to state.
      dispatch(dispatchStepData(goal));
      dispatch(updateGoal(goal));

      // Save to database.
      await saveCurrentStep(goal, goalIndex);
    } else {
      goal.completed = true;
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
      const goalHistory = getState().goalsState.historyState.history;
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

export async function loadGoalData(goal: Goal) {
  switch (goal.goalType) {
    case GoalType.MergeDups:
      goal = await loadMergeDupsData(goal);
      break;
    default:
      break;
  }
  return goal;
}

export function updateStepFromData(goal: Goal): Goal {
  switch (goal.goalType) {
    case GoalType.MergeDups: {
      const currentGoalData = goal.data as MergeDupData;
      goal.steps[goal.currentStep] = {
        words: currentGoalData.plannedWords[goal.currentStep],
      };
      break;
    }
    default:
      break;
  }
  return goal;
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
}

async function saveCurrentStep(goal: Goal, goalIndex: number) {
  const userEditId = getUserEditId();
  if (userEditId) {
    const step = goal.steps[goal.currentStep] ?? {};
    await Backend.addStepToGoal(userEditId, goalIndex, step, goal.currentStep);
  }
}
