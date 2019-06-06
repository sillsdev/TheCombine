import React from "react";

import { Goals, GoalsState } from "../../../types/goals";
import Stack from "../../../types/stack";
import { Goal } from "../GoalComponent/GoalComponent";

export interface GoalsStateProps {
  history: Stack<Goals>;
  all: Goals[];
  suggestions: Stack<Goals>;
}

export class GoalHistory extends React.Component<GoalsState> {
  constructor(props: GoalsState) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        {this.props.history.stack.map(goal => (
          <Goal key={goal.id} goal={goal} />
        ))}
      </div>
    );
  }
}
