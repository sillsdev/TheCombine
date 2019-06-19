import { NavState } from "../../types/nav";
import { NAVIGATE_BACK, NAVIGATE_FORWARD } from "./NavigationActions";
import { ActionWithPayload } from "../../types/action";
import { Goal } from "../../types/goals";
import { Action } from "redux";

export const defaultState: NavState = {
  VisibleComponentId: 0,
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
        VisibleComponentId:
          previousDisplay != undefined
            ? previousDisplay
            : state.VisibleComponentId,
        DisplayHistory: displayHistoryCopy,
        NavBarState: {
          ShouldRenderBackButton: shouldRenderBackButton(displayHistoryCopy)
        }
      });
    case NAVIGATE_FORWARD:
      let actionWithPayload = action as ActionWithPayload<Goal>; // TODO: Seems bad. Change?
      let newDisplayHistory = [
        ...state.DisplayHistory,
        state.VisibleComponentId
      ];

      return Object.assign({}, state, {
        VisibleComponentId: actionWithPayload.payload.id,
        DisplayHistory: newDisplayHistory,
        NavBarState: {
          ShouldRenderBackButton: shouldRenderBackButton(newDisplayHistory)
        }
      });
    default:
      return state;
  }
};

export function shouldRenderBackButton(history: number[]): boolean {
  return history.length > 0;
}
