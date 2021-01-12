import { Dispatch } from "redux";
import { ThunkDispatch } from "redux-thunk";

import * as Backend from "../../backend";
import * as LocalStorage from "../../backend/localStorage";
import { CreateCharInv } from "../../goals/CreateCharInv/CreateCharInv";
import { CreateStrWordInv } from "../../goals/CreateStrWordInv/CreateStrWordInv";
import { HandleFlags } from "../../goals/HandleFlags/HandleFlags";
import DupFinder from "../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import { MergeDupData, MergeDups } from "../../goals/MergeDupGoal/MergeDups";
import {
  generateBlacklistHash,
  MergeTreeAction,
  refreshWords,
} from "../../goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import { ReviewEntries } from "../../goals/ReviewEntries/ReviewEntries";
import { SpellCheckGloss } from "../../goals/SpellCheckGloss/SpellCheckGloss";
import { ValidateChars } from "../../goals/ValidateChars/ValidateChars";
import { ValidateStrWords } from "../../goals/ValidateStrWords/ValidateStrWords";
import history, { Path } from "../../history";
import { StoreState } from "../../types";
import { Goal, GoalType, maxNumSteps } from "../../types/goals";
import { ActionWithPayload } from "../../types/mockAction";
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
  return async (dispatch: Dispatch<GoalAction>) => {
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
  return async (dispatch: ThunkDispatch<StoreState, any, GoalAction>) => {
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
  return async (dispatch: ThunkDispatch<StoreState, any, GoalAction>) => {
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
  return async (dispatch: ThunkDispatch<any, any, MergeTreeAction>) => {
    switch (goal.goalType) {
      case GoalType.MergeDups:
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

        await dispatch(refreshWords());

        break;
      default:
        break;
    }
    return goal;
  };
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

function goalTypeToGoal(type: GoalType) {
  switch (type) {
    case GoalType.CreateCharInv:
      return new CreateCharInv();
    case GoalType.CreateStrWordInv:
      return new CreateStrWordInv();
    case GoalType.HandleFlags:
      return new HandleFlags();
    case GoalType.MergeDups:
      return new MergeDups();
    case GoalType.ReviewEntries:
      return new ReviewEntries();
    case GoalType.SpellcheckGloss:
      return new SpellCheckGloss();
    case GoalType.ValidateChars:
      return new ValidateChars();
    case GoalType.ValidateStrWords:
      return new ValidateStrWords();
    default:
      return new Goal();
  }
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
