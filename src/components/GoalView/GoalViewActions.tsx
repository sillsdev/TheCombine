import { Dispatch } from "react";
import { Action } from "redux";
import { Goal } from "../../types/goals";

export const ADD_GOAL = "ADD_GOAL";
export type ADD_GOAL = typeof ADD_GOAL;

// action types
export interface ActionWithPayload<T> extends Action {
  payload: T;
}

export interface AddGoal extends ActionWithPayload<Goal> {
  type: ADD_GOAL;
  payload: Goal;
}

export type AddGoalAction = AddGoal;

export function asyncAddGoal(goal: Goal) {
  return async (dispatch: Dispatch<AddGoal>) => {
    dispatch(addGoal(goal));
  };
}

export function addGoal(goal: Goal): AddGoal {
  return { type: ADD_GOAL, payload: goal };
}
