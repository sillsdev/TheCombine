import { Dispatch } from "redux";
import { ThunkDispatch } from "redux-thunk";

import * as Backend from "../../backend";
import * as LocalStorage from "../../backend/localStorage";
import { CreateCharInv } from "../../goals/CreateCharInv/CreateCharInv";
import { CreateStrWordInv } from "../../goals/CreateStrWordInv/CreateStrWordInv";
import { HandleFlags } from "../../goals/HandleFlags/HandleFlags";
import DupFinder from "../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import { MergeDupData, MergeDups } from "../../goals/MergeDupGoal/MergeDups";
import { Hash } from "../../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import {
  MergeTreeAction,
  refreshWords,
} from "../../goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import { ReviewEntries } from "../../goals/ReviewEntries/ReviewEntries";
import { SpellCheckGloss } from "../../goals/SpellCheckGloss/SpellCheckGloss";
import { ValidateChars } from "../../goals/ValidateChars/ValidateChars";
import { ValidateStrWords } from "../../goals/ValidateStrWords/ValidateStrWords";
import history from "../../history";
import { StoreState } from "../../types";
import { Goal, GoalType } from "../../types/goals";
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
            history.push(`/goals/${resp}`);
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
        let finder = new DupFinder();

        //Used for testing duplicate finder. (See docs/bitmap_testing.md)
        //let t0 = performance.now();

        let groups = await finder.getNextDups();

        //Used for testing duplicate finder. (See docs/bitmap_testing.md)
        //console.log(performance.now() - t0);

        let usedIDs: string[] = [];

        let newGroups = [];

        let blacklist: Hash<boolean> = LocalStorage.getMergeDupsBlacklist();

        for (let group of groups) {
          let newGroup = [];
          for (let word of group) {
            if (!usedIDs.includes(word.id)) {
              usedIDs.push(word.id);
              newGroup.push(word);
            }
          }
          // check blacklist
          let groupIds = newGroup.map((a) => a.id).sort();
          let groupHash = groupIds.reduce((val, acc) => `${acc}:${val}`, "");
          if (!blacklist[groupHash] && newGroup.length > 1) {
            newGroups.push(newGroup);
          }
        }

        if (newGroups.length >= 8) {
          newGroups = newGroups.slice(0, 8);
        }

        goal.data = { plannedWords: newGroups };
        goal.numSteps = newGroups.length;
        goal.currentStep = 0;
        goal.steps = [];

        await dispatch(refreshWords());

        break;
      case GoalType.CreateCharInv:
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
      let currentGoalData: MergeDupData = JSON.parse(
        JSON.stringify(goal.data as MergeDupData)
      );
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

function convertEditsToArrayOfGoals(edits: Edit[]): Goal[] {
  let history: Goal[] = [];
  for (var edit of edits) {
    let nextGoal: Goal | undefined = goalTypeToGoal(edit.goalType);
    if (nextGoal) {
      history.push(nextGoal);
    }
  }
  return history;
}

function goalTypeToGoal(type: number): Goal | undefined {
  switch (type) {
    case GoalType.CreateCharInv:
      return new CreateCharInv();
    case GoalType.ValidateChars:
      return new ValidateChars();
    case GoalType.CreateStrWordInv:
      return new CreateStrWordInv();
    case GoalType.ValidateStrWords:
      return new ValidateStrWords();
    case GoalType.MergeDups:
      return new MergeDups();
    case GoalType.SpellcheckGloss:
      return new SpellCheckGloss();
    case GoalType.ReviewEntries:
      return new ReviewEntries();
    case GoalType.HandleFlags:
      return new HandleFlags();
    default:
      return undefined;
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
