import React from "react";
import { NavState } from "../../types/nav";
import { CHANGE_DISPLAY } from "./NavigationActions";
import { ActionWithPayload } from "../../types/action";
import { Goal } from "../../types/goals";
import { GoalTimeline } from "../GoalView/GoalTimelineComponent";

export const defaultState: NavState = {
  VisibleComponent: <GoalTimeline />
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
        VisibleComponent: action.payload.display
      };
    default:
      return state;
  }
};
