import { Dispatch } from "react";
import { Action } from "redux";
import { Goals } from "../../types/goals";

export const ADD_GOAL = "ADD_GOAL";
export type ADD_GOAL = typeof ADD_GOAL;

// action types
export interface ActionWithPayload<T> extends Action {
  payload: T;
}

export interface AddGoal extends ActionWithPayload<Goals> {
  type: ADD_GOAL;
  payload: Goals;
}

export type AddGoalAction = AddGoal;

export function asyncAddGoal(goal: Goals) {
  return async (dispatch: Dispatch<AddGoal>) => {
    dispatch(addGoal(goal));
  };
}

export function addGoal(goal: Goals): AddGoal {
  return { type: ADD_GOAL, payload: goal };
}
