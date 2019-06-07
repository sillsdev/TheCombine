import React from "react";

import { Goal } from "../../../types/goals";
import Stack from "../../../types/stack";
import { GoalComponent } from "../GoalComponent/GoalComponent";

export interface GoalFutureProps {
  history: Stack<Goal>;
  goalOptions: Goal[];
  suggestions: Stack<Goal>;
}

export class GoalFuture extends React.Component<GoalFutureProps> {
  constructor(props: GoalFutureProps) {
    super(props);
  }

  render() {
    return (
      <div className="GoalPicker">
        {this.props.suggestions.stack.map(goal => (
          <GoalComponent key={goal.id} goal={goal} />
        ))}
      </div>
    );
  }
}
