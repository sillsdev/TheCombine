import { GoalProps } from "../../../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

export class DisplayProg extends React.Component<
  GoalProps & LocalizeContextProps
> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return <div />;
  }
}

export default withLocalize(DisplayProg);
