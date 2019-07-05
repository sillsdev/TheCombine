import { GoalProps, Goal } from "../../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import DisplayProg from "./DisplayProg/displayProg";
import AppBarComponent from "../../../components/AppBar/AppBarComponent";
import PageNotFound from "../../../components/PageNotFound/component";
import EmptyGoalComponent from "../../../components/EmptyGoal/EmptyGoalComponent";

class BaseGoalScreen extends React.Component<GoalProps & LocalizeContextProps> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  renderGoal(goal: Goal): JSX.Element {
    return (
      <div className="GoalDisplay content">
        <AppBarComponent />
        <DisplayProg goal={this.props.goal} />
        {goal.steps.length > 0 ? (
          goal.steps[goal.curNdx]
        ) : (
          <EmptyGoalComponent />
        )}
      </div>
    );
  }

  render() {
    return (
      <div className={"GoalDisplay"}>
        {this.props.goal ? this.renderGoal(this.props.goal) : <PageNotFound />}
      </div>
    );
  }
}

export default withLocalize(BaseGoalScreen);
