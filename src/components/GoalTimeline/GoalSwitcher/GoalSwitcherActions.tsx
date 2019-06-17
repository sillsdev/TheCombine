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
    dispatch(timelineActions.addGoalToHistory(goal));
    dispatch(navActions.navigateForward(goal));
  };
}

export function chooseGoal(goal: Goal): ChooseGoal {
  return { type: CHOOSE_GOAL, payload: goal };
}
