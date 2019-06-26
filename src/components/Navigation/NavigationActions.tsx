import { Goal } from "../../types/goals";

export const CHANGE_VISIBLE_COMPONENT = "CHANGE_VISIBLE_COMPONENT";
export type CHANGE_VISIBLE_COMPONENT = typeof CHANGE_VISIBLE_COMPONENT;

export interface NavigationAction {
  type: CHANGE_VISIBLE_COMPONENT;
  payload: Goal;
}

export function changeVisibleComponent(goal: Goal): NavigationAction {
  return { type: CHANGE_VISIBLE_COMPONENT, payload: goal };
}
