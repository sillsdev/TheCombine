import * as Backend from "../../backend";
import * as LocalStorage from "../../backend/localStorage";
import { MergeDupData } from "../../goals/MergeDupGoal/MergeDups";
import {
  getMergeStepData,
  loadMergeDupsData,
} from "../../goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import history, { Path } from "../../history";
import { StoreState } from "../../types";
import { ActionWithPayload, StoreStateDispatch } from "../../types/actions";
import { Goal, GoalHistoryState, GoalType } from "../../types/goals";
import { goalTypeToGoal } from "../../types/goalUtilities";
import { User } from "../../types/user";
import { Edit } from "../../types/userEdit";

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

export function asyncLoadExistingUserEdits(
  projectId: string,
  userEditId: string
) {
  return async (dispatch: StoreStateDispatch) => {
    await Backend.getUserEditById(projectId, userEditId)
      .then((userEdit) => {
        let history: Goal[] = convertEditsToArrayOfGoals(userEdit.edits);
        dispatch(loadUserEdits(history));
      })
      .catch((err) => {
        console.log(err);
      });
  };
}

export function asyncGetUserEdits() {
  return async (dispatch: StoreStateDispatch) => {
    const user = LocalStorage.getCurrentUser();
    const projectId = LocalStorage.getProjectId();
    if (user && projectId) {
      const userEditId = getUserEditId(user);

      if (userEditId !== undefined) {
        dispatch(asyncLoadExistingUserEdits(projectId, userEditId));
      } else {
        dispatch(Backend.createUserEdit);
      }
    }
  };
}

export function asyncAddGoalToHistory(goal: Goal) {
  return async (dispatch: StoreStateDispatch) => {
    const user = LocalStorage.getCurrentUser();
    if (user) {
      const userEditId = getUserEditId(user);
      if (userEditId !== undefined) {
        dispatch(asyncLoadGoalData(goal)).then(
          (returnedGoal) => (goal = returnedGoal)
        );
        await Backend.addGoalToUserEdit(userEditId, goal)
          .then((resp) => {
            dispatch(addGoalToHistory(goal));
            history.push(`${Path.Goals}/${resp}`);
          })
          .catch((err: string) => {
            console.log(err);
          });
      }
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
    let historyState: GoalHistoryState = getState().goalsState.historyState;
    let goal: Goal = historyState.history[historyState.history.length - 1];
    goal.currentStep++;
    // Push the current step into the history state and load the data.
    await dispatch(asyncRefreshWords());
  };
}

export function asyncRefreshWords() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    let historyState = getState().goalsState.historyState;
    let goal = historyState.history[historyState.history.length - 1];

    // Push the current step into the history state and load the data.
    await updateStep(dispatch, goal, historyState).then(() => {
      historyState = getState().goalsState.historyState;
      goal = historyState.history[historyState.history.length - 1];
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

export function getUserEditId(user: User): string | undefined {
  const projectId = LocalStorage.getProjectId();
  let projectIds = Object.keys(user.workedProjects);
  let matches: string[] = projectIds.filter((project) => projectId === project);
  if (matches.length === 1) {
    return user.workedProjects[matches[0]];
  }
}

export function getIndexInHistory(history: Goal[], currentGoal: Goal): number {
  for (let i = 0; i < history.length; i++) {
    if (history[i].hash === currentGoal.hash) {
      return i;
    }
  }
  return -1;
}

function convertEditsToArrayOfGoals(edits: Edit[]) {
  const history: Goal[] = [];
  for (const edit of edits) {
    const nextGoal = goalTypeToGoal(edit.goalType);
    history.push(nextGoal);
  }
  return history;
}

function updateStep(
  dispatch: StoreStateDispatch,
  goal: Goal,
  state: GoalHistoryState
): Promise<void> {
  return new Promise((resolve) => {
    const updatedGoal = updateStepData(goal);
    dispatch(updateGoal(updatedGoal));
    const goalIndex = getIndexInHistory(state.history, goal);
    addStepToGoal(state.history[goalIndex], goalIndex);
    resolve();
  });
}

async function addStepToGoal(goal: Goal, goalIndex: number) {
  const user = LocalStorage.getCurrentUser();
  if (user) {
    const userEditId: string | undefined = getUserEditId(user);
    if (userEditId !== undefined) {
      await Backend.addStepToGoal(userEditId, goalIndex, goal);
    }
  }
}
