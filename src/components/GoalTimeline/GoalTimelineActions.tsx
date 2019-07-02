import { Goal } from "../../types/goals";
import { ActionWithPayload } from "../../types/action";
import { Dispatch } from "react";
import * as backend from "../../backend";
import history from "../../history";
import { UserEdit, Edit } from "../../types/userEdit";
import { User } from "../../types/user";
import { CreateCharInv } from "../../goals/CreateCharInv/CreateCharInv";
import { ValidateChars } from "../../goals/ValidateChars/ValidateChars";
import { CreateStrWordInv } from "../../goals/CreateStrWordInv/CreateStrWordInv";
import { ValidateStrWords } from "../../goals/ValidateStrWords/ValidateStrWords";
import { MergeDups } from "../../goals/MergeDupGoal/MergeDups";
import { SpellCheckGloss } from "../../goals/SpellCheckGloss/SpellCheckGloss";
import { ViewFinal } from "../../goals/ViewFinal/ViewFinal";
import { HandleFlags } from "../../goals/HandleFlags/HandleFlags";

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
      .getGoal(id)
      .then(resp => {
        // Update user object with id of user edits
        let userEdits: UserEdit = resp;
        let currentUserString = localStorage.getItem("user");
        let currentUserObject: User;
        if (currentUserString) {
          currentUserObject = JSON.parse(currentUserString);
          currentUserObject.userEditId = resp.id;
          currentUserString = JSON.stringify(currentUserObject);
          localStorage.setItem("user", currentUserString);
        }

        let history: Goal[] = [];
        for (var edit of resp.edits) {
          let nextGoal: Goal;
          switch (edit.goalType) {
            case 0:
              nextGoal = new CreateCharInv([]);
              break;
            case 1:
              nextGoal = new ValidateChars([]);
              break;
            case 2:
              nextGoal = new CreateStrWordInv([]);
              break;
            case 3:
              nextGoal = new ValidateStrWords([]);
              break;
            case 4:
              nextGoal = new MergeDups([]);
              break;
            case 5:
              nextGoal = new SpellCheckGloss([]);
              break;
            case 6:
              nextGoal = new ViewFinal([]);
              break;
            case 7:
              nextGoal = new HandleFlags([]);
              break;
            default:
              nextGoal = new ViewFinal([]);
              break;
          }
          history.push(nextGoal);
        }
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
    let userString = localStorage.getItem("user");
    let userObject: User;
    let userEditId: string = "";
    if (userString) {
      userObject = JSON.parse(userString);
      userEditId = userObject.userEditId;
    }

    // Decide what to send to the api as the edit
    await backend
      .addGoal(userEditId, goal)
      .then(resp => {
        dispatch(addGoalToHistory(goal));
        history.push(`/goals/${resp}`);
      })
      .catch(err => {
        console.log("Unsuccessfully added goal");
      });
  };
}

export function addGoalToHistory(goal: Goal): AddGoalToHistory {
  return { type: ADD_GOAL_TO_HISTORY, payload: [goal] };
}

export function loadUserEdits(history: Goal[]): LoadUserEdits {
  return { type: LOAD_USER_EDITS, payload: history };
}
