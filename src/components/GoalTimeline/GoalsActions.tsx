import * as Backend from "../../backend";
import * as LocalStorage from "../../backend/localStorage";
import DupFinder from "../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import { MergeDupData, MergeDups } from "../../goals/MergeDupGoal/MergeDups";
import {
  generateBlacklistHash,
  refreshWords,
} from "../../goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import history, { Path } from "../../history";
import { ActionWithPayload, StoreStateDispatch } from "../../types/actions";
import { Goal, GoalType } from "../../types/goals";
import { goalTypeToGoal, maxNumSteps } from "../../types/goalUtilities";
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
        dispatch(loadGoalData(goal)).then(
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

export function loadGoalData(goal: Goal) {
  return async (dispatch: StoreStateDispatch) => {
    switch (goal.goalType) {
      case GoalType.MergeDups:
        goal = await loadMergeDupsData(goal);
        await dispatch(refreshWords());

        break;
      default:
        break;
    }
    return goal;
  };
}

export async function loadMergeDupsData(goal: MergeDups) {
  const finder = new DupFinder();
  const groups = await finder.getNextDups();

  const usedIDs: string[] = [];
  const newGroups = [];
  const blacklist = LocalStorage.getMergeDupsBlacklist();

  for (const group of groups) {
    // Remove words that are already included.
    const newGroup = group.filter((w) => !usedIDs.includes(w.id));
    if (newGroup.length < 2) {
      continue;
    }

    // Add if not blacklisted.
    const groupIds = newGroup.map((w) => w.id);
    const groupHash = generateBlacklistHash(groupIds);
    if (!blacklist[groupHash]) {
      newGroups.push(newGroup);
      usedIDs.push(...groupIds);
    }

    // Stop the process once maxNumSteps many groups found.
    if (newGroups.length === maxNumSteps(goal.goalType)) {
      break;
    }
  }

  // Add data to goal.
  goal.data = { plannedWords: newGroups };
  goal.numSteps = newGroups.length;

  // Reset goal steps.
  goal.currentStep = 0;
  goal.steps = [];

  return goal;
}

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

export function addGoalToHistory(goal: Goal): AddGoalToHistoryAction {
  return { type: GoalsActions.ADD_GOAL_TO_HISTORY, payload: [goal] };
}

export function loadUserEdits(history: Goal[]): LoadUserEditsAction {
  return { type: GoalsActions.LOAD_USER_EDITS, payload: history };
}

export function updateGoal(goal: Goal): UpdateGoalAction {
  return { type: GoalsActions.UPDATE_GOAL, payload: [goal] };
}
