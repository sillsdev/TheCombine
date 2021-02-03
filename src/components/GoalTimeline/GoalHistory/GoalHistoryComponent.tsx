import React from "react";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

import BaseGoalSelect from "goals/DefaultGoal/BaseGoalWidget/BaseGoalWidget";
import { Goal } from "types/goals";

export interface GoalHistoryProps {
  history: Goal[];
}

export class GoalHistory extends React.Component<
  GoalHistoryProps & LocalizeContextProps
> {
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

export default withLocalize(GoalHistory);
