import React from "react";

import { Goal } from "../../../types/goals";
import Stack from "../../../types/stack";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

export interface GoalHistoryProps {
  history: Stack<Goal>;
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
        {this.props.history.stack.map(goal => goal.goalWidget)}
      </div>
    );
  }
}

export default withLocalize(GoalHistory);
