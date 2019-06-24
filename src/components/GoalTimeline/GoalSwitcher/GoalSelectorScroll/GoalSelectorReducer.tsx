import {
  GoalScrollAction,
  SELECT_ACTION,
  MOUSE_ACTION
} from "./GoalSelectorAction";
import { GoalSelectorState } from "../../../../types/goals";

export const defaultState: GoalSelectorState = {
  selectedIndex: 0,
  goalOptions: [],
  mouseX: 0,
  lastIndex: 0
};

export const goalSelectReducer = (
  state: GoalSelectorState | undefined,
  action: GoalScrollAction
): GoalSelectorState => {
  if (!state) return defaultState;
  switch (action.type) {
    case SELECT_ACTION:
      return {
        ...state,
        selectedIndex: action.payload
      };

    case MOUSE_ACTION:
      return {
        ...state,
        mouseX: action.payload
      };

    default:
      return state;
  }
};
