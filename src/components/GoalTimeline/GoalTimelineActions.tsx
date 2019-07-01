import { Goal } from "../../types/goals";
import { ActionWithPayload } from "../../types/action";
import { Dispatch } from "react";
import * as backend from "../../backend";
import history from "../../history";

export const LOAD_USER_EDITS = "LOAD_USER_EDITS";
export type LOAD_USER_EDITS = typeof LOAD_USER_EDITS;

export interface LoadUserEdits extends ActionWithPayload<string> {
  type: LOAD_USER_EDITS;
  payload: string;
}

export const ADD_GOAL_TO_HISTORY = "ADD_GOAL_TO_HISTORY";
export type ADD_GOAL_TO_HISTORY = typeof ADD_GOAL_TO_HISTORY;

export interface AddGoalToHistory extends ActionWithPayload<Goal> {
  type: ADD_GOAL_TO_HISTORY;
  payload: Goal;
}

export type AddGoalToHistoryAction = AddGoalToHistory;
export type LoadUserEditsAction = LoadUserEdits;

export function asyncLoadUserEdits(id: string) {
  return async (dispatch: Dispatch<LoadUserEditsAction>) => {
    await backend
      .getGoal(id)
      .then(resp => {
        // console.log(resp);
      })
      .catch(err => {
        // console.log(err);
      });
  };
}

export function asyncAddGoalToHistory(goal: Goal) {
  return async (dispatch: Dispatch<AddGoalToHistoryAction>, getState: any) => {
    await backend
      .addGoal(goal)
      .then(resp => {
        console.log("Added goal successfully");
        goal = resp;
        dispatch(addGoalToHistory(goal));
        history.push(`/goals/${goal.id}`);
      })
      .catch(err => {
        console.log("Unsuccessfully added goal");
      });
  };
}

export function addGoalToHistory(goal: Goal): AddGoalToHistory {
  return { type: ADD_GOAL_TO_HISTORY, payload: goal };
}
