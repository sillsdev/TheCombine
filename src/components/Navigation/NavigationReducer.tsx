import { NavState } from "../../types/nav";
import { NAVIGATE_BACK, NAVIGATE_FORWARD } from "./NavigationActions";
import { ActionWithPayload } from "../../types/action";
import { Goal } from "../../types/goals";
import { Action } from "redux";

export const defaultState: NavState = {
  VisibleComponentName: "goalTimeline",
  DisplayHistory: [],
  NavBarState: {
    ShouldRenderBackButton: false
  }
};

export const navReducer = (
  state: NavState | undefined,
  action: Action
): NavState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case NAVIGATE_BACK:
      let displayHistoryCopy = [...state.DisplayHistory];
      let previousDisplay = displayHistoryCopy.pop();

      return Object.assign({}, state, {
        VisibleComponentName: previousDisplay
          ? previousDisplay
          : state.VisibleComponentName,
        DisplayHistory: displayHistoryCopy,
        NavBarState: {
          ShouldRenderBackButton: shouldRenderBackButton(displayHistoryCopy)
        }
      });
    case NAVIGATE_FORWARD:
      let actionWithPayload = action as ActionWithPayload<Goal>; // TODO: Seems bad. Change?
      let newDisplayHistory = [
        ...state.DisplayHistory,
        state.VisibleComponentName
      ];

      return Object.assign({}, state, {
        VisibleComponentName: actionWithPayload.payload.name,
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
