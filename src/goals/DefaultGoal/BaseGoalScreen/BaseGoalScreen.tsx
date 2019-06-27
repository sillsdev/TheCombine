import { GoalProps } from "../../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import DisplayProg from "./DisplayProg/displayProg";
import AppBarComponent from "../../../components/AppBar/AppBarComponent";

class BaseGoalScreen extends React.Component<GoalProps & LocalizeContextProps> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div className={"GoalDisplay" + this.props.goal.id}>
        <AppBarComponent title={this.props.goal.name} />
        <DisplayProg goal={this.props.goal} />
        {this.props.goal.steps[this.props.goal.curNdx]}
      </div>
    );
  }
}

export default withLocalize(BaseGoalScreen);
