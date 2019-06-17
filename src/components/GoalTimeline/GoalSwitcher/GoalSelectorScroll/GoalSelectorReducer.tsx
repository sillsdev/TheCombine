import {
  ScrollAction,
  SELECT_ACTION,
  MOUSE_ACTION
} from "./GoalSelectorAction";
import { GoalSelectorState } from "../../../../types/goals";

export const defaultState: GoalSelectorState = {
  ndx: 0,
  goalOptions: [],
  iX: 0,
  end: 0
};

export const goalSelectReducer = (
  state: GoalSelectorState | undefined,
  action: ScrollAction
): GoalSelectorState => {
  if (!state) return defaultState;
  switch (action.type) {
    case SELECT_ACTION:
      return {
        ...state,
        ndx: action.payload
      };

    case MOUSE_ACTION:
      return {
        ...state,
        iX: action.payload
      };

    default:
      return state;
  }
};
