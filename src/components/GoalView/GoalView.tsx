import React from "react";

import GoalHistory from "./GoalHistory";
import GoalSelector from "./GoalSelector";
import GoalFuture from "./GoalFuture";
import { Goal } from "../../types/goals";

export interface GoalViewProps {
  displayGoal: (goal: Goal) => void;
}

export class GoalView extends React.Component<GoalViewProps> {
  constructor(props: GoalViewProps) {
    super(props);
  }

  render() {
    return (
      <div className="GoalView">
        <GoalHistory />
        <GoalSelector displayGoal={this.props.displayGoal} />
        <GoalFuture />
      </div>
    );
  }
}
