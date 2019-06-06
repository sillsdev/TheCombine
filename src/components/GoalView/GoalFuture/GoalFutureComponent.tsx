import React from "react";

import { Goals } from "../../../types/goals";
import Stack from "../../../types/stack";
import { Goal } from "../GoalComponent/GoalComponent";

export interface GoalFutureProps {
  history: Stack<Goals>;
  all: Goals[];
  suggestions: Stack<Goals>;
}

export class GoalFuture extends React.Component<GoalFutureProps> {
  constructor(props: GoalFutureProps) {
    super(props);
  }
  render() {
    return (
      <div className="GoalPicker">
        {this.props.suggestions.stack.map(goal => (
          <Goal key={goal.id} goal={goal} />
        ))}
      </div>
    );
  }
}
