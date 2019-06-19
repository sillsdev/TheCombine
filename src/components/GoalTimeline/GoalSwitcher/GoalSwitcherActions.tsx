import { Dispatch } from "react";
import { Goal } from "../../../types/goals";
import { ActionWithPayload } from "../../../types/action";
import * as timelineActions from "../GoalTimelineActions";
import * as navActions from "../../Navigation/NavigationActions";

export const CHOOSE_GOAL = "CHOOSE_GOAL";
export type CHOOSE_GOAL =
  | typeof CHOOSE_GOAL
  | timelineActions.ADD_GOAL
  | navActions.NAVIGATE_FORWARD;

export interface ChooseGoal extends ActionWithPayload<Goal> {
  type: CHOOSE_GOAL;
  payload: Goal;
}

export type ChooseGoalAction = ChooseGoal;

export function asyncChooseGoal(goal: Goal) {
  return async (dispatch: Dispatch<ChooseGoal>) => {
    goal.id = Math.floor(Math.random() * 100000 + 1);
    dispatch(navActions.navigateForward(goal));
    dispatch(timelineActions.addGoalToHistory(goal));
  };
}

export function chooseGoal(goal: Goal): ChooseGoal {
  return { type: CHOOSE_GOAL, payload: goal };
}
