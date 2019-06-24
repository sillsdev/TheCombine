import React from "react";
import { GoalProps, Goal } from "../../types/goals";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import BaseGoalScreen from "../../goals/DefaultGoal/BaseGoalScreen/BaseGoalScreen";

export interface GoalWrapperProps {
  goal: Goal;
}

export class GoalWrapper extends React.Component<
  GoalProps & LocalizeContextProps
> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <BaseGoalScreen goal={this.props.goal} />
      </div>
    );
  }
}

export default withLocalize(GoalWrapper);
