import { Dispatch } from "react";
import { Goal } from "../../types/goals";
import { ActionWithPayload } from "../../types/action";

export const ADD_GOAL = "ADD_GOAL";
export type ADD_GOAL = typeof ADD_GOAL;

export interface AddGoal extends ActionWithPayload<Goal> {
  type: ADD_GOAL;
  payload: Goal;
}

export type AddGoalAction = AddGoal;

export function asyncAddGoalToHistory(goal: Goal) {
  return async (dispatch: Dispatch<AddGoal>) => {
    dispatch(addGoalToHistory(goal));
  };
}

export function addGoalToHistory(goal: Goal): AddGoal {
  return { type: ADD_GOAL, payload: goal };
}
