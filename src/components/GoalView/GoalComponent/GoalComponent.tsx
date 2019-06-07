import React from "react";

import { Goal } from "../../../types/goals";

export interface GoalProps {
  goal: Goal;
}

export class GoalComponent extends React.Component<GoalProps> {
  constructor(props: GoalProps) {
    super(props);
  }

  render() {
    return (
      <div className="Goal">
        <h1>{this.props.goal.name}</h1>
      </div>
    );
  }
}
