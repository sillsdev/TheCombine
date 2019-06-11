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
        VisibleComponent: setVisibleComponent(state),
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

function setVisibleComponent(state: NavState): JSX.Element {
  let previousElement = state.DisplayHistory.pop();
  if (previousElement) {
    return previousElement;
  }
  return state.VisibleComponent;
}
