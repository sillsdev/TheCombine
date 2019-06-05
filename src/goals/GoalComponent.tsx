import React from "react";
import { Goals } from "../types/goals";

export interface GoalProps {
  goal: Goals;
}

export class Goal extends React.Component<GoalProps> {
  constructor(props: GoalProps) {
    super(props);
  }

  render() {
    return (
      <div className="Goal">
        <h1>{this.props.goal.data.words}</h1>
      </div>
    );
  }
}
