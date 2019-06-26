import { NavState } from "../../types/nav";
import {
  NavigationAction,
  CHANGE_VISIBLE_COMPONENT
} from "./NavigationActions";

export const defaultState: NavState = {
  VisibleComponentId: "0",
  NavBarState: {
    Title: "Default Title"
  }
};

export const navReducer = (
  state: NavState | undefined,
  action: NavigationAction
): NavState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case CHANGE_VISIBLE_COMPONENT:
      return {
        VisibleComponentId: action.payload.id,
        NavBarState: {
          Title: action.payload.name
        }
      };
    default:
      return state;
  }
};
