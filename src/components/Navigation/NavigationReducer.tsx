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
  DisplayHistory: new Stack<JSX.Element>([])
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
        DisplayHistory: removeDisplayFromHistory(state.DisplayHistory)
      };
    case NAVIGATE_FORWARD:
      let actionWithPayload = action as ActionWithPayload<Goal>; // TODO: Seems bad. Change?
      return {
        VisibleComponent: actionWithPayload.payload.display,
        DisplayHistory: addDisplayToHistory(
          state.VisibleComponent,
          state.DisplayHistory
        )
      };
    default:
      return state;
  }
};

export function addDisplayToHistory(
  display: JSX.Element,
  history: Stack<JSX.Element>
): Stack<JSX.Element> {
  history.push(display);
  return history;
}

export function removeDisplayFromHistory(
  history: Stack<JSX.Element>
): Stack<JSX.Element> {
  history.pop();
  return history;
}

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
