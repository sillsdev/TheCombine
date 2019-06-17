import { Dispatch } from "react";
import { Goal } from "../../types/goals";
import { ActionWithPayload } from "../../types/action";
import { Action } from "redux";

export const NAVIGATE_BACK = "NAVIGATE_BACK";
export type NAVIGATE_BACK = typeof NAVIGATE_BACK;

export const NAVIGATE_FORWARD = "NAVIGATE_FORWARD";
export type NAVIGATE_FORWARD = typeof NAVIGATE_FORWARD;

export interface NavigateBack extends Action {
  type: NAVIGATE_BACK;
}

export interface NavigateForward extends ActionWithPayload<Goal> {
  type: NAVIGATE_FORWARD;
  payload: Goal;
}

export type NavigateBackAction = NavigateBack;
export type NavigateForwardAction = NavigateForward;

export function asyncNavigateBack() {
  return async (dispatch: Dispatch<NavigateBack>) => {
    dispatch(navigateBack());
  };
}

export function asyncNavigateForward(goal: Goal) {
  return async (dispatch: Dispatch<NavigateForward>) => {
    dispatch(navigateForward(goal));
  };
}

export function navigateBack(): NavigateBack {
  return { type: NAVIGATE_BACK };
}

export function navigateForward(goal: Goal): NavigateForward {
  return { type: NAVIGATE_FORWARD, payload: goal };
}
