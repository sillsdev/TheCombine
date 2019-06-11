import { Dispatch } from "react";
import { Goal } from "../../types/goals";
import { ActionWithPayload } from "../../types/action";

export const CHANGE_DISPLAY = "CHANGE_DISPLAY";
export type CHANGE_DISPLAY = typeof CHANGE_DISPLAY;

export interface ChangeDisplay extends ActionWithPayload<Goal> {
  type: CHANGE_DISPLAY;
  payload: Goal;
}

export type ChangeDisplayAction = ChangeDisplay;

export function asyncChangeDisplay(goal: Goal) {
  return async (dispatch: Dispatch<ChangeDisplay>) => {
    dispatch(changeDisplay(goal));
  };
}

export function changeDisplay(goal: Goal): ChangeDisplay {
  return { type: CHANGE_DISPLAY, payload: goal };
}
