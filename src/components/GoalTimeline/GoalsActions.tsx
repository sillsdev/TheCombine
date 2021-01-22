import * as Backend from "backend";
import * as LocalStorage from "backend/localStorage";
import { MergeDupData } from "goals/MergeDupGoal/MergeDups";
import {
  getMergeStepData,
  loadMergeDupsData,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import history, { Path } from "browserHistory";
import { StoreState } from "types";
import { ActionWithPayload, StoreStateDispatch } from "types/actions";
import { Goal, GoalType } from "types/goals";
import { goalTypeToGoal } from "types/goalUtilities";
import { Edit } from "types/userEdit";

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

export interface AddGoalToHistoryAction extends ActionWithPayload<Goal[]> {
  type: GoalsActions.ADD_GOAL_TO_HISTORY;
  payload: Goal[];
}

export interface UpdateGoalAction extends ActionWithPayload<Goal[]> {
  type: GoalsActions.UPDATE_GOAL;
  payload: Goal[];
}

export function addGoalToHistory(goal: Goal): AddGoalToHistoryAction {
  return { type: GoalsActions.ADD_GOAL_TO_HISTORY, payload: [goal] };
}

export function loadUserEdits(history: Goal[]): LoadUserEditsAction {
  return { type: GoalsActions.LOAD_USER_EDITS, payload: history };
}

export function updateGoal(goal: Goal): UpdateGoalAction {
  return { type: GoalsActions.UPDATE_GOAL, payload: [goal] };
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
    const history = convertEditsToGoals(userEdit.edits);
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
      goal = await dispatch(asyncLoadGoalData(goal));
      const goalIndex = await Backend.addGoalToUserEdit(userEditId, goal);
      dispatch(addGoalToHistory(goal));
      history.push(`${Path.Goals}/${goalIndex}`);
    }
  };
}

export function asyncLoadGoalData(goal: Goal) {
  return async (dispatch: StoreStateDispatch) => {
    switch (goal.goalType) {
      case GoalType.MergeDups:
        goal = await loadMergeDupsData(goal);
        await dispatch(asyncRefreshWords());
        break;

      default:
        break;
    }
    return goal;
  };
}

export function asyncAdvanceStep() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const goalHistory = getState().goalsState.historyState.history;
    const goal = goalHistory[goalHistory.length - 1];
    goal.currentStep++;
    // Push the current step into the history state and load the data.
    await dispatch(asyncRefreshWords());
  };
}

export function asyncRefreshWords() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    let goalHistory = getState().goalsState.historyState.history;
    let goal = goalHistory[goalHistory.length - 1];

    // Push the current step into the history state and load the data.
    await updateStep(dispatch, goal, goalHistory).then(() => {
      goalHistory = getState().goalsState.historyState.history;
      goal = goalHistory[goalHistory.length - 1];
      if (goal.currentStep < goal.numSteps) {
        if (goal.goalType === GoalType.MergeDups) {
          getMergeStepData(goal, dispatch);
        }
      } else {
        history.push(Path.Goals);
      }
    });
  };
}

// Helper Funtions

export function updateStepData(goal: Goal): Goal {
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

function convertEditsToGoals(edits: Edit[]): Goal[] {
  return edits.map((edit) => goalTypeToGoal(edit.goalType));
}

async function updateStep(
  dispatch: StoreStateDispatch,
  goal: Goal,
  goalHistory: Goal[]
): Promise<void> {
  const goalIndex = goalHistory.findIndex((g) => g.hash === goal.hash);
  const updatedGoal = updateStepData(goal);
  dispatch(updateGoal(updatedGoal));
  await addStepToGoal(goalHistory[goalIndex], goalIndex);
}

async function addStepToGoal(goal: Goal, goalIndex: number) {
  const userEditId = getUserEditId();
  if (userEditId) {
    await Backend.addStepToGoal(userEditId, goalIndex, goal);
  }
}
