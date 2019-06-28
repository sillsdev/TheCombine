import { GoalProps } from "../../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import DisplayProg from "./DisplayProg/displayProg";
import AppBarComponent from "../../../components/AppBar/AppBarComponent";
import EmptyGoalComponent from "../../../components/EmptyGoal/EmptyGoalComponent";

class BaseGoalScreen extends React.Component<GoalProps & LocalizeContextProps> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div className={"GoalDisplay" + this.props.goal.id}>
        <AppBarComponent />
        <DisplayProg goal={this.props.goal} />
        {this.props.goal.steps.length > 0 ? (
          this.props.goal.steps[this.props.goal.curNdx]
        ) : (
          <EmptyGoalComponent />
        )}
      </div>
    );
  }
}

export default withLocalize(BaseGoalScreen);
