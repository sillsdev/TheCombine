import React from "react";

import GoalWidget from "components/GoalTimeline/GoalHistory/GoalWidget";
import { Goal } from "types/goals";

interface GoalHistoryProps {
  history: Goal[];
}

export default class GoalHistory extends React.Component<GoalHistoryProps> {
  render() {
    return (
      <div className="GoalHistory">
        {this.props.history.map((goal) => (
          <GoalWidget key={goal.goalType} goal={goal} />
        ))}
      </div>
    );
  }
}
