import React from "react";
import { NavState } from "../../types/nav";
import { CHANGE_DISPLAY } from "./NavigationActions";
import { ActionWithPayload } from "../../types/action";
import { Goal } from "../../types/goals";
import { GoalTimeline } from "../GoalView/GoalTimelineComponent";
import Stack from "../../types/stack";

export const defaultState: NavState = {
  PreviousComponent: <GoalTimeline />,
  VisibleComponent: <GoalTimeline />,
  DisplayHistory: new Stack<JSX.Element>([]),
  GoBack: () => console.log("Go Back")
};

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
        PreviousComponent: state.PreviousComponent,
        VisibleComponent: action.payload.display,
        DisplayHistory: state.DisplayHistory,
        GoBack: state.GoBack
      };
    default:
      return state;
  }
};
