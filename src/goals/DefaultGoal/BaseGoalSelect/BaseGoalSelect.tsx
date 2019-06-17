import { GoalProps } from "../../../types/goals";
import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";

class BaseGoalSelect extends React.Component<GoalProps & LocalizeContextProps> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <Translate id={"goal.name." + this.props.goal.name} />
      </div>
    );
  }
}

export default withLocalize(BaseGoalSelect);
