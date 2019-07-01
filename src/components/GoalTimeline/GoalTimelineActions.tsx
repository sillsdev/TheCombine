import { Goal } from "../../types/goals";
import { ActionWithPayload } from "../../types/action";
import { Dispatch } from "react";
import * as backend from "../../backend";
import history from "../../history";

export const ADD_GOAL_TO_HISTORY = "ADD_GOAL_TO_HISTORY";
export type ADD_GOAL_TO_HISTORY = typeof ADD_GOAL_TO_HISTORY;

export interface AddGoalToHistory extends ActionWithPayload<Goal> {
  type: ADD_GOAL_TO_HISTORY;
  payload: Goal;
}

export type AddGoalToHistoryAction = AddGoalToHistory;

export function asyncAddGoalToHistory(goal: Goal) {
  return async (dispatch: Dispatch<AddGoalToHistoryAction>, getState: any) => {
    await backend
      .addGoal(goal)
      .then(resp => {
        console.log("Added goal successfully");
        //goal = resp;
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
