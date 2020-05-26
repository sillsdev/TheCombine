import {
  GoalScrollAction,
  SELECT_ACTION,
  MOUSE_ACTION,
} from "./GoalSelectorAction";
import { GoalSelectorState } from "../../../../types/goals";
import { StoreAction, StoreActions } from "../../../../rootActions";

export const defaultState: GoalSelectorState = {
  selectedIndex: 0,
  allPossibleGoals: [],
  mouseX: 0,
  lastIndex: 0,
};

export const goalSelectReducer = (
  state: GoalSelectorState | undefined,
  action: StoreAction | GoalScrollAction
): GoalSelectorState => {
  if (!state) return defaultState;
  switch (action.type) {
    case SELECT_ACTION:
      return {
        ...state,
        selectedIndex: action.payload,
      };
    case MOUSE_ACTION:
      return {
        ...state,
        mouseX: action.payload,
      };
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
