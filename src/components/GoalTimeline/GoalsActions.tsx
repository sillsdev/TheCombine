import { Goal } from "../../types/goals";
import { ActionWithPayload } from "../../types/mockAction";
import { Dispatch } from "redux";
import * as backend from "../../backend";
import history from "../../history";
import { User } from "../../types/user";
import { CreateCharInv } from "../../goals/CreateCharInv/CreateCharInv";
import { ValidateChars } from "../../goals/ValidateChars/ValidateChars";
import { CreateStrWordInv } from "../../goals/CreateStrWordInv/CreateStrWordInv";
import { ValidateStrWords } from "../../goals/ValidateStrWords/ValidateStrWords";
import { MergeDups } from "../../goals/MergeDupGoal/MergeDups";
import { SpellCheckGloss } from "../../goals/SpellCheckGloss/SpellCheckGloss";
import { ViewFinal } from "../../goals/ViewFinal/ViewFinal";
import { HandleFlags } from "../../goals/HandleFlags/HandleFlags";
import { Edit } from "../../types/userEdit";
import { GoalType } from "../../types/goals";
import DupFinder from "../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../types";

export const LOAD_USER_EDITS = "LOAD_USER_EDITS";
export type LOAD_USER_EDITS = typeof LOAD_USER_EDITS;

export interface LoadUserEdits extends ActionWithPayload<Goal[]> {
  type: LOAD_USER_EDITS;
  payload: Goal[];
}

export const ADD_GOAL_TO_HISTORY = "ADD_GOAL_TO_HISTORY";
export type ADD_GOAL_TO_HISTORY = typeof ADD_GOAL_TO_HISTORY;

export interface AddGoalToHistory extends ActionWithPayload<Goal[]> {
  type: ADD_GOAL_TO_HISTORY;
  payload: Goal[];
}

export const NEXT_STEP = "NEXT_STEP";
export type NEXT_STEP = typeof NEXT_STEP;

export interface NextStep extends ActionWithPayload<Goal[]> {
  type: NEXT_STEP;
}

export const UPDATE_GOAL = "UPDATE_GOAL";
export type UPDATE_GOAL = typeof UPDATE_GOAL;

export interface UpdateGoal extends ActionWithPayload<Goal[]> {
  type: UPDATE_GOAL;
  payload: Goal[];
}

export type AddGoalToHistoryAction = AddGoalToHistory;
export type LoadUserEditsAction = LoadUserEdits;
export type UpdateGoalAction = UpdateGoal;

export function asyncLoadUserEdits(projectId: string, userEditId: string) {
  return async (dispatch: Dispatch<LoadUserEditsAction>) => {
    await backend
      .getUserEditById(projectId, userEditId)
      .then(userEdit => {
        let history: Goal[] = convertEditsToArrayOfGoals(userEdit.edits);
        dispatch(loadUserEdits(history));
      })
      .catch(err => {
        console.log(err);
      });
  };
}

function asyncCreateNewUserEditsObject(projectId: string) {
  return async () => {
    await backend
      .createUserEdit()
      .then(async (userEditId: string) => {
        let updatedUser: User = updateUserIfExists(projectId, userEditId);
        await backend.updateUser(updatedUser);
      })
      .catch(err => {
        console.log(err);
      });
  };
}

export function asyncGetUserEdits() {
  return async (
    dispatch: ThunkDispatch<StoreState, any, LoadUserEditsAction>
  ) => {
    let currentUserString = localStorage.getItem("user");
    if (currentUserString) {
      let currentUserObject: User = JSON.parse(currentUserString);
      let projectId: string = backend.getProjectId();
      let userEditId: string | undefined =
        currentUserObject.workedProjects[projectId];
      if (userEditId != undefined) {
        dispatch(asyncLoadUserEdits(projectId, userEditId));
      } else {
        dispatch(asyncCreateNewUserEditsObject(projectId));
      }
    }
  };
}

export function asyncAddGoalToHistory(goal: Goal) {
  return async (dispatch: Dispatch<AddGoalToHistoryAction>, getState: any) => {
    let userEditId: string = getUserEditId();

    await loadGoalData(goal).then(returnedGoal => (goal = returnedGoal));
    await backend
      .addGoalToUserEdit(userEditId, goal)
      .then(resp => {
        dispatch(addGoalToHistory(goal));
        history.push(`/goals/${resp}`);
      })
      .catch((err: string) => {
        console.log(err);
      });
  };
}

export async function loadGoalData(goal: Goal): Promise<Goal> {
  switch (goal.goalType) {
    case GoalType.MergeDups:
      let finder = new DupFinder();
      await finder.getNextDups(goal.numSteps).then(words => {
        goal.data = { plannedWords: words };
      });
      break;
    case GoalType.CreateCharInv:
      break;
    default:
      break;
  }
  return goal;
}

function getUserEditId(): string {
  let userString = localStorage.getItem("user");
  let userObject: User;
  let userEditId: string = "";
  if (userString) {
    userObject = JSON.parse(userString);
    let projectId = backend.getProjectId();
    userEditId = userObject.workedProjects[projectId];
  }
  return userEditId;
}

function updateUserIfExists(projectId: string, userEditId: string): User {
  let currentUserString = localStorage.getItem("user");
  let updatedUser: User = new User("", "", "");
  if (currentUserString) {
    let updatedUserString = updateUserWithUserEditId(
      currentUserString,
      projectId,
      userEditId
    );
    localStorage.setItem("user", updatedUserString);
    updatedUser = JSON.parse(updatedUserString);
  }
  return updatedUser;
}

function updateUserWithUserEditId(
  userObjectString: string,
  projectId: string,
  userEditId: string
): string {
  let currentUserObject: User = JSON.parse(userObjectString);
  currentUserObject.workedProjects[projectId] = userEditId;
  let updatedUserString = JSON.stringify(currentUserObject);
  return updatedUserString;
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
    case GoalType.ViewFind:
      return new ViewFinal();
    case GoalType.HandleFlags:
      return new HandleFlags();
    default:
      return undefined;
  }
}

export function addGoalToHistory(goal: Goal): AddGoalToHistory {
  return { type: ADD_GOAL_TO_HISTORY, payload: [goal] };
}

export function loadUserEdits(history: Goal[]): LoadUserEdits {
  return { type: LOAD_USER_EDITS, payload: history };
}

export function nextStep(): NextStep {
  return { type: NEXT_STEP, payload: [] };
}

export function updateGoal(goal: Goal): UpdateGoal {
  return { type: UPDATE_GOAL, payload: [goal] };
}
