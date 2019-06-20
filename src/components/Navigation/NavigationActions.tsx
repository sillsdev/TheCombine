import { Goal } from "../../types/goals";

export const NAVIGATE_BACK = "NAVIGATE_BACK";
export type NAVIGATE_BACK = typeof NAVIGATE_BACK;

export const NAVIGATE_FORWARD = "NAVIGATE_FORWARD";
export type NAVIGATE_FORWARD = typeof NAVIGATE_FORWARD;

export interface NavigationAction {
  type: NAVIGATE_BACK | NAVIGATE_FORWARD;
  payload: Goal | undefined;
}

export function navigateBack(): NavigationAction {
  return { type: NAVIGATE_BACK, payload: undefined };
}

export function navigateForward(goal: Goal): NavigationAction {
  return { type: NAVIGATE_FORWARD, payload: goal };
}
