import React from "react";

import { Goal } from "../../../types/goals";
import Stack from "../../../types/stack";
import BaseGoalSelect from "../../../goals/DefaultGoal/BaseGoalSelect";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

export interface GoalsStateProps {
  history: Stack<Goal>;
}

export class GoalHistory extends React.Component<
  GoalsStateProps & LocalizeContextProps
> {
  constructor(props: GoalsStateProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        {this.props.history.stack.map(goal => (
          <BaseGoalSelect key={goal.id} goal={goal} />
        ))}
      </div>
    );
  }
}

export default withLocalize(GoalHistory);
