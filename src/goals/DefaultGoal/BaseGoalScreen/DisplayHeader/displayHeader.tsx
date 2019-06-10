import { GoalProps } from "../../../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

export class DisplayHeader extends React.Component<
  GoalProps & LocalizeContextProps
> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>{this.props.goal.name}</h1>
      </div>
    );
  }
}

export default withLocalize(DisplayHeader);
