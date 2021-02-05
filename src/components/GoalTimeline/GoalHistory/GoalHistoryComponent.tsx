import React from "react";

import BaseGoalSelect from "goals/DefaultGoal/BaseGoalWidget/BaseGoalWidget";
import { Goal } from "types/goals";

interface GoalHistoryProps {
  history: Goal[];
}

export default class GoalHistory extends React.Component<GoalHistoryProps> {
  render() {
    return (
      <div className="GoalHistory">
        {this.props.history.map((goal) => (
          <BaseGoalSelect key={goal.goalType} goal={goal} />
        ))}
      </div>
    );
  }
}
