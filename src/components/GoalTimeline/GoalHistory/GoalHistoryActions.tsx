import { Goal } from "../../../types/goals";
import { ActionWithPayload } from "../../../types/action";
import { Dispatch } from "react";
import * as backend from "../../../backend";

export const LOAD_GOAL_HISTORY = "LOAD_GOAL_HISTORY";
export type LOAD_GOAL_HISTORY = typeof LOAD_GOAL_HISTORY;

export interface LoadGoalHistory extends ActionWithPayload<Goal[]> {
  type: LOAD_GOAL_HISTORY;
  payload: Goal[];
}

export type LoadGoalHistoryAction = LoadGoalHistory;

export function asyncLoadGoalHistory() {
  return async (dispatch: Dispatch<LoadGoalHistoryAction>, getState: any) => {
    let history: Goal[] = [];
    await backend
      .getAllGoals()
      .then(resp => {
        console.log(resp);
        history = resp;
        dispatch(loadGoalHistory(history));
      })
      .catch(err => console.log(err));

    return history;
  };
}

export function loadGoalHistory(goals: Goal[]): LoadGoalHistory {
  return { type: LOAD_GOAL_HISTORY, payload: goals };
}
