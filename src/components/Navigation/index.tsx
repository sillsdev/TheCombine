import React from "react";
import Navigation, { NavComponentProps } from "./NavigationComponent";

import { connect } from "react-redux";
import { StoreState } from "../../types/index";
import { ComponentMap } from "./ComponentMap";
import { GoalTimeline } from "../GoalTimeline/GoalTimelineComponent";

export function mapStateToProps(state: StoreState): NavComponentProps {
  return {
    VisibleComponent: getComponentById(state.navState.VisibleComponentId)
  };
}

// Get a component from the hash table of active components
// If a component is not found, return a default component (like a 404 page)
// For now, return GoalTimeline
export function getComponentById(id: number): JSX.Element {
  let component = ComponentMap.get(id);
  if (component) {
    return component;
  }
  return <GoalTimeline />;
}

export default connect(mapStateToProps)(Navigation);
