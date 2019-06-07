import React from "react";

import GoalHistory from "./GoalHistory";
import GoalSelector from "./GoalSelector";
import GoalFuture from "./GoalFuture";
import { Goal } from "../../types/goals";
import Stack from "../../types/stack";

export interface GoalViewProps {}

export interface GoalViewState {
  goalHistory: Stack<Goal>;
  all: Goal[];
  goalSuggestions: Stack<Goal>;
}

export class GoalView extends React.Component<GoalViewProps, GoalViewState> {
  constructor(props: GoalViewProps) {
    super(props);
    this.state = {
      goalHistory: new Stack<Goal>([]),
      all: [],
      goalSuggestions: new Stack<Goal>([])
    };
  }

  render() {
    return (
      <div className="GoalView">
        <GoalHistory />
        <GoalSelector />
        <GoalFuture />
      </div>
    );
  }
}
