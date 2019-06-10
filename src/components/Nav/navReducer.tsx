import { NavState } from "../../types/nav";
import { CHANGE_DISPLAY, ActionWithPayload } from "./navActions";
import { defaultState } from "./defaultState";
import { Goal } from "../../types/goals";

export const navReducer = (
  state: NavState | undefined,
  action: ActionWithPayload<Goal>
): NavState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case CHANGE_DISPLAY:
      return {
        CurrentComponent: action.payload.display
      };
    default:
      return state;
  }
};
