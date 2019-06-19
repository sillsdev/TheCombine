import React from "react";

import { Goal } from "../../../types/goals";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import BaseGoalSelect from "../../../goals/DefaultGoal/BaseGoalSelect/BaseGoalSelect";

export interface GoalHistoryProps {
  history: Goal[];
}

export class GoalHistory extends React.Component<
  GoalHistoryProps & LocalizeContextProps
> {
  constructor(props: GoalHistoryProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        {this.props.history.map(goal => (
          <BaseGoalSelect goal={goal} />
        ))}
      </div>
    );
  }
}

export default withLocalize(GoalHistory);
