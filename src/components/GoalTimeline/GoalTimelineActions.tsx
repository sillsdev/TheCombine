import { Goal } from "../../types/goals";
import { ActionWithPayload } from "../../types/mockAction";
import { Dispatch } from "react";
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

export type AddGoalToHistoryAction = AddGoalToHistory;
export type LoadUserEditsAction = LoadUserEdits;

export function asyncLoadUserEdits(id: string) {
  return async (dispatch: Dispatch<LoadUserEditsAction>) => {
    await backend
      .getUserEditById(id)
      .then(resp => {
        updateUserIfExists(resp.id);
        let history: Goal[] = convertEditsToArrayOfGoals(resp.edits);
        dispatch(loadUserEdits(history));
        return resp;
      })
      .catch(err => {
        console.log(err);
      });
  };
}

export function asyncAddGoalToHistory(goal: Goal) {
  return async (dispatch: Dispatch<AddGoalToHistoryAction>, getState: any) => {
    let userEditId: string = getUserEditId();
    await backend
      .addGoalToUserEdit(userEditId, goal)
      .then(resp => {
        dispatch(addGoalToHistory(goal));
        history.push(`/goals/${resp}`);
      })
      .catch(err => {
        console.log("Failed to add goal to history");
      });
  };
}

function getUserEditId(): string {
  let userString = localStorage.getItem("user");
  let userObject: User;
  let userEditId: string = "";
  if (userString) {
    userObject = JSON.parse(userString);
    userEditId = userObject.userEditId;
  }
  return userEditId;
}

function updateUserIfExists(userEditId: string) {
  let currentUserString = localStorage.getItem("user");
  if (currentUserString) {
    let updatedUserString = updateUserWithUserEditId(
      currentUserString,
      userEditId
    );
    localStorage.setItem("user", updatedUserString);
  }
}

function updateUserWithUserEditId(
  userObjectString: string,
  userEditId: string
): string {
  let currentUserObject: User = JSON.parse(userObjectString);
  currentUserObject.userEditId = userEditId;
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
      return new CreateCharInv([]);
    case GoalType.ValidateChars:
      return new ValidateChars([]);
    case GoalType.CreateStrWordInv:
      return new CreateStrWordInv([]);
    case GoalType.ValidateStrWords:
      return new ValidateStrWords([]);
    case GoalType.MergeDups:
      return new MergeDups([]);
    case GoalType.SpellcheckGloss:
      return new SpellCheckGloss([]);
    case GoalType.ViewFind:
      return new ViewFinal([]);
    case GoalType.HandleFlags:
      return new HandleFlags([]);
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
