export const SELECT_ACTION = "PRESS_BUTTON";
export type SELECT_ACTION = typeof SELECT_ACTION;

export const MOUSE_ACTION = "MOUSE_ACTION";
export type MOUSE_ACTION = typeof MOUSE_ACTION;

//action types
export interface ScrollSelectorAct {
  type: SELECT_ACTION;
  payload: number;
}
export interface MouseMoveAct {
  type: MOUSE_ACTION;
  payload: number;
}

export function scrollSelectorIndexAction(ndx: number): ScrollSelectorAct {
  return {
    type: SELECT_ACTION,
    payload: ndx
  };
}

export function scrollSelectorMouseAction(iX: number): MouseMoveAct {
  return {
    type: MOUSE_ACTION,
    payload: iX
  };
}

export type ScrollAction = ScrollSelectorAct | MouseMoveAct;
