import { GoalProps } from "../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import BaseGoalScreen from "../DefaultGoal/BaseGoalScreen/BaseGoalScreen";

class SpellCheckGlossComponent extends React.Component<
  GoalProps & LocalizeContextProps
> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return <BaseGoalScreen goal={this.props.goal} />;
  }
}

export default withLocalize(SpellCheckGlossComponent);
