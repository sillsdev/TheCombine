import React from "react";
import Navigation, { NavComponentProps } from "./NavigationComponent";

import { connect } from "react-redux";
import { StoreState } from "../../types/index";
import { GoalTimeline } from "../GoalTimeline/GoalTimelineComponent";
import { Goal } from "../../types/goals";
import BaseGoalScreen from "../../goals/DefaultGoal/BaseGoalScreen/BaseGoalScreen";

export function mapStateToProps(state: StoreState): NavComponentProps {
  return {
    VisibleComponent: getComponentById(state, state.navState.VisibleComponentId)
  };
}

// Find the goal referenced by navState.VisibleComponentId and create a
// React component to contain it
export function getComponentById(
  state: StoreState,
  componentId: string
): JSX.Element {
  let allGoals: Goal[] = state.goalsState.goalOptions;

  for (var goal of allGoals) {
    if (goal.id === componentId) {
      return <BaseGoalScreen goal={goal} />;
    }
  }
  return <GoalTimeline />;
}

export default connect(mapStateToProps)(Navigation);
