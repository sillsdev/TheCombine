import React from "react";

import { Goal, GoalsState } from "../../../types/goals";
import Stack from "../../../types/stack";
import { GoalComponent } from "../GoalComponent/GoalComponent";

export interface GoalsStateProps {
  history: Stack<Goal>;
  goalOptions: Goal[];
  suggestions: Stack<Goal>;
}

export class GoalHistory extends React.Component<GoalsState> {
  constructor(props: GoalsState) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        {this.props.history.stack.map(goal => (
          <GoalComponent key={goal.id} goal={goal} />
        ))}
      </div>
    );
  }
}
