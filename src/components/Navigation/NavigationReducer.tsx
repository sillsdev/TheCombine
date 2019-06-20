import { NavState } from "../../types/nav";
import {
  NAVIGATE_BACK,
  NAVIGATE_FORWARD,
  NavigationAction
} from "./NavigationActions";

export const defaultState: NavState = {
  VisibleComponentId: "0",
  DisplayHistory: [],
  NavBarState: {
    ShouldRenderBackButton: false
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
    case NAVIGATE_BACK:
      let displayHistoryCopy = [...state.DisplayHistory];
      let previousDisplay = displayHistoryCopy.pop();

      let visibleComponentId = previousDisplay
        ? previousDisplay
        : state.VisibleComponentId;

      return {
        VisibleComponentId: visibleComponentId,
        DisplayHistory: displayHistoryCopy,
        NavBarState: {
          ShouldRenderBackButton: shouldRenderBackButton(displayHistoryCopy)
        }
      };
    case NAVIGATE_FORWARD:
      let payload = action.payload;
      if (!payload) {
        return state;
      }

      let newDisplayHistory = [
        ...state.DisplayHistory,
        state.VisibleComponentId
      ];

      return Object.assign({}, state, {
        VisibleComponentId: payload.id,
        DisplayHistory: newDisplayHistory,
        NavBarState: {
          ShouldRenderBackButton: shouldRenderBackButton(newDisplayHistory)
        }
      });
    default:
      return state;
  }
};

export function shouldRenderBackButton(history: string[]): boolean {
  return history.length > 0;
}
