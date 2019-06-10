import { Goal } from "../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

export interface BaseGoalSelectProps {
  goal: Goal;
}

class BaseGoalSelect extends React.Component<
  BaseGoalSelectProps & LocalizeContextProps
> {
  constructor(props: BaseGoalSelectProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return <div>{this.props.goal.name}</div>;
  }
}

export default withLocalize(BaseGoalSelect);
