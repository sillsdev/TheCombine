import { Dispatch } from "react";
import { Action } from "redux";
import { Goals } from "../types/goals";

export const ADD_GOAL_TO_HISTORY = "ADD_GOAL_TO_HISTORY";
export type ADD_GOAL_TO_HISTORY = typeof ADD_GOAL_TO_HISTORY;

// action types
export interface ActionWithPayload<T> extends Action {
  payload: T;
}

export interface AddGoalToHistory extends ActionWithPayload<Goals> {
  type: ADD_GOAL_TO_HISTORY;
  payload: Goals;
}

export type AddGoalToHistoryAction = AddGoalToHistory;

export function asyncAddGoalToHistory(goal: Goals) {
  return async (dispatch: Dispatch<AddGoalToHistory>) => {
    dispatch(addGoalToHistory(goal));
  };
}

export function addGoalToHistory(goal: Goals): AddGoalToHistory {
  return { type: ADD_GOAL_TO_HISTORY, payload: goal };
}
