import React from "react";

import { Goal } from "../../../types/goals";
import {
  withLocalize,
  LocalizeContextProps,
  Translate
} from "react-localize-redux";

export interface GoalProps {
  goal: Goal;
}

export class GoalComponent extends React.Component<
  GoalProps & LocalizeContextProps
> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div className="goal">
        <h1>
          <Translate id={"goal.name." + this.props.goal.name} />
        </h1>
      </div>
    );
  }
}

export default withLocalize(GoalComponent);
