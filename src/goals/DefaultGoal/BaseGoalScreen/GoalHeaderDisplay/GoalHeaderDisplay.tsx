import { GoalProps } from "../../../../types/goals";
import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";

export class GoalHeaderDisplay extends React.Component<
  GoalProps & LocalizeContextProps
> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>
          <Translate id={"goal.name." + this.props.goal.name} />
        </h1>
      </div>
    );
  }
}

export default withLocalize(GoalHeaderDisplay);
