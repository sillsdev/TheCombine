import React from "react";
import { Goal } from "../../types/goals";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import BaseGoalScreen from "../../goals/DefaultGoal/BaseGoalScreen/BaseGoalScreen";
import { RouteComponentProps, withRouter } from "react-router-dom";
import PageNotFound from "../PageNotFound/component";

export interface TParams {
  id: string;
}

export interface GoalWrapperProps {
  goal: Goal | undefined;
}

// Wraps a goal object in a React component.
export class GoalWrapper extends React.Component<
  RouteComponentProps<TParams> & GoalWrapperProps & LocalizeContextProps
> {
  render() {
    return (
      <div>
        {this.props.goal ? (
          <BaseGoalScreen goal={this.props.goal} />
        ) : (
          <PageNotFound />
        )}
      </div>
    );
  }
}

export default withRouter(withLocalize(GoalWrapper));
