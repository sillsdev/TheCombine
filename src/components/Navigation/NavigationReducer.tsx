import React from "react";
import { NavState } from "../../types/nav";
import { NAVIGATE_BACK, NAVIGATE_FORWARD } from "./NavigationActions";
import { ActionWithPayload } from "../../types/action";
import { Goal } from "../../types/goals";
import { GoalTimeline } from "../GoalView/GoalTimelineComponent";
import Stack from "../../types/stack";
import { Action } from "redux";

export const defaultState: NavState = {
  VisibleComponent: <GoalTimeline />,
  DisplayHistory: new Stack<JSX.Element>([]),
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
      return {
        VisibleComponent: setVisibleToPreviousDisplay(
          state.VisibleComponent,
          state.DisplayHistory
        ),
        DisplayHistory: removeDisplayFromHistory(state.DisplayHistory),
        NavBarState: {
          ShouldRenderBackButton: shouldRenderBackButton(state.DisplayHistory)
        }
      };
    case NAVIGATE_FORWARD:
      let actionWithPayload = action as ActionWithPayload<Goal>; // TODO: Seems bad. Change?
      return {
        VisibleComponent: setVisibleToGivenInAction(actionWithPayload),
        DisplayHistory: addDisplayToHistory(
          state.VisibleComponent,
          state.DisplayHistory
        ),
        NavBarState: {
          ShouldRenderBackButton: shouldRenderBackButton(state.DisplayHistory)
        }
      };
    default:
      return state;
  }
};

// Add a React component to the display history
export function addDisplayToHistory(
  display: JSX.Element,
  history: Stack<JSX.Element>
): Stack<JSX.Element> {
  history.push(display);
  return history;
}

// Remove a React component from the display history
export function removeDisplayFromHistory(
  history: Stack<JSX.Element>
): Stack<JSX.Element> {
  history.pop();
  return history;
}

// Replace the visible component with the previous component that was displayed
export function setVisibleToPreviousDisplay(
  visibleDisplay: JSX.Element,
  history: Stack<JSX.Element>
): JSX.Element {
  let previousElement = history.pop();
  if (previousElement) {
    return previousElement;
  }
  return visibleDisplay;
}

export function setVisibleToGivenInAction(
  action: ActionWithPayload<Goal>
): JSX.Element {
  return action.payload.display;
}

export function shouldRenderBackButton(history: Stack<JSX.Element>): boolean {
  return history.size() > 0;
}
