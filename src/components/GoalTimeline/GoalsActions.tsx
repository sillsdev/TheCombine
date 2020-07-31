import { Dispatch } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { Goal, GoalType } from "../../types/goals";
import { ActionWithPayload } from "../../types/mockAction";
import * as Backend from "../../backend";
import * as LocalStorage from "../../backend/localStorage";
import history from "../../history";
import { User } from "../../types/user";
import { CreateCharInv } from "../../goals/CreateCharInv/CreateCharInv";
import { ValidateChars } from "../../goals/ValidateChars/ValidateChars";
import { CreateStrWordInv } from "../../goals/CreateStrWordInv/CreateStrWordInv";
import { ValidateStrWords } from "../../goals/ValidateStrWords/ValidateStrWords";
import { MergeDupData, MergeDups } from "../../goals/MergeDupGoal/MergeDups";
import { SpellCheckGloss } from "../../goals/SpellCheckGloss/SpellCheckGloss";
import { ReviewEntries } from "../../goals/ReviewEntries/ReviewEntries";
import { HandleFlags } from "../../goals/HandleFlags/HandleFlags";
import { Edit } from "../../types/userEdit";
import DupFinder from "../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import { StoreState } from "../../types";
import { Hash } from "../../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import {
  MergeTreeAction,
  refreshWords,
} from "../../goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";

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

function asyncCreateNewUserEditsObject(projectId: string) {
  return async () => {
    await Backend.createUserEdit()
      .then(async (userEditId: string) => {
        const userId: string = LocalStorage.getUserId();
        let updatedUser: User = await Backend.getUser(userId);
        updatedUser.workedProjects[projectId] = userEditId;
        Backend.updateUser(updatedUser).then((user: User) =>
          LocalStorage.setUser(user)
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
}

export function asyncGetUserEdits() {
  return async (dispatch: ThunkDispatch<StoreState, any, GoalAction>) => {
    const projectId: string = LocalStorage.getProjectId();
    if (projectId) {
      const userEditId: string | undefined = getUserEditId();
      if (userEditId) {
        dispatch(asyncLoadExistingUserEdits(projectId, userEditId));
      } else {
        dispatch(asyncCreateNewUserEditsObject(projectId));
      }
    }
  };
}

export function asyncAddGoalToHistory(goal: Goal) {
  return async (dispatch: ThunkDispatch<StoreState, any, GoalAction>) => {
    let userEditId: string | undefined = getUserEditId();
    if (userEditId) {
      dispatch(loadGoalData(goal)).then(
        (returnedGoal) => (goal = returnedGoal)
      );
      await Backend.addGoalToUserEdit(userEditId, goal)
        .then((resp) => {
          dispatch(addGoalToHistory(goal));
          history.push(`/goals/${resp}`);
          LocalStorage.updateWorkedProjects();
        })
        .catch((err: string) => {
          console.log(err);
        });
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

export function getUserEditId(): string | undefined {
  const projectId: string = LocalStorage.getProjectId();
  const workedProjects: Hash<string> = LocalStorage.getWorkedProjects();
  const projectIds = Object.keys(workedProjects);
  const matches: string[] = projectIds.filter(
    (project) => projectId === project
  );
  if (matches) {
    return workedProjects[matches[0]];
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
