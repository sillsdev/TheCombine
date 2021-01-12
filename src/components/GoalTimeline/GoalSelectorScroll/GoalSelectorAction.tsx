export const SELECT_ACTION = "PRESS_BUTTON";
export type SELECT_ACTION = typeof SELECT_ACTION;

export const MOUSE_ACTION = "MOUSE_ACTION";
export type MOUSE_ACTION = typeof MOUSE_ACTION;

//action types
export interface GoalScrollAction {
  type: SELECT_ACTION | MOUSE_ACTION;
  payload: number;
}

export function scrollSelectorIndexAction(
  selectedIndex: number
): GoalScrollAction {
  return {
    type: SELECT_ACTION,
    payload: selectedIndex,
  };
}

export function scrollSelectorMouseAction(mouseX: number): GoalScrollAction {
  return {
    type: MOUSE_ACTION,
    payload: mouseX,
  };
}
