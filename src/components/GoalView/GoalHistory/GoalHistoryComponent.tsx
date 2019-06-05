import React from "react";

import { Goals } from "../../../types/goals";
import { Stack } from "../../../types/stack";
import { Goal } from "../GoalComponent/GoalComponent";

export interface GoalHistoryProps {
  goals: Stack<Goals>;
}

export class GoalHistory extends React.Component<GoalHistoryProps> {
  constructor(props: GoalHistoryProps) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        {/* {this.props.goals.stack.map(goal => (
          <Goal key={goal.id} goal={goal} />
        ))} */}
      </div>
    );
  }
}
