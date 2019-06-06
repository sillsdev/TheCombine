import React from "react";

import GoalHistory from "./GoalHistory";
import GoalSelector from "./GoalSelector";
import GoalFuture from "./GoalFuture";
import { Goals } from "../../types/goals";
import Stack from "../../types/stack";

export interface GoalViewProps {}

export interface GoalViewState {
  goalHistory: Stack<Goals>;
  all: Goals[];
  goalSuggestions: Stack<Goals>;
}

export class GoalView extends React.Component<GoalViewProps, GoalViewState> {
  constructor(props: GoalViewProps) {
    super(props);
    this.state = {
      goalHistory: new Stack<Goals>([]),
      all: [],
      goalSuggestions: new Stack<Goals>([])
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
