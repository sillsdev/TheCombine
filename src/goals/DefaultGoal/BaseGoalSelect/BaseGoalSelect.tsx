import { GoalProps } from "../../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

class BaseGoalSelect extends React.Component<GoalProps & LocalizeContextProps> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return <div>{this.props.goal.name}</div>;
  }
}

export default withLocalize(BaseGoalSelect);
