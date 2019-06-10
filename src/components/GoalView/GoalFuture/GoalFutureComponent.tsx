import React from "react";

import { Goal } from "../../../types/goals";
import Stack from "../../../types/stack";
import GoalComponent from "../GoalComponent/GoalComponent";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

export interface GoalFutureProps {
  suggestions: Stack<Goal>;
}

export class GoalFuture extends React.Component<
  GoalFutureProps & LocalizeContextProps
> {
  constructor(props: GoalFutureProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div className="GoalPicker">
        {this.props.suggestions.stack.map(goal => (
          <GoalComponent key={goal.id} goal={goal} />
        ))}
      </div>
    );
  }
}

export default withLocalize(GoalFuture);
