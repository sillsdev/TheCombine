import React from "react";

import { Goal } from "../../../types/goals";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import BaseGoalSelect from "../../../goals/DefaultGoal/BaseGoalWidget/BaseGoalWidget";

export interface GoalHistoryProps {
  history: Goal[];
  asyncLoadHistory?: () => void;
}

export class GoalHistory extends React.Component<
  GoalHistoryProps & LocalizeContextProps
> {
  constructor(props: GoalHistoryProps & LocalizeContextProps) {
    super(props);
  }

  componentDidMount() {
    if (this.props.asyncLoadHistory) {
      this.props.asyncLoadHistory();
    }
  }

  render() {
    return (
      <div className="GoalHistory">
        {this.props.history.map(goal => (
          <BaseGoalSelect key={goal.id} goal={goal} />
        ))}
      </div>
    );
  }
}

export default withLocalize(GoalHistory);
