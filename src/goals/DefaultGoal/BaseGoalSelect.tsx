import { Goal } from "../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

class BaseGoalSelect extends React.Component<Goal & LocalizeContextProps> {
  constructor(props: Goal & LocalizeContextProps) {
    super(props);
  }

  render() {
    return <div>{this.props.name}</div>;
  }
}

export default withLocalize(BaseGoalSelect);
