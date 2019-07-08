import { GoalProps } from "../../../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

export class DisplayProg extends React.Component<
  GoalProps & LocalizeContextProps
> {
  render() {
    return <div />;
  }
}

export default withLocalize(DisplayProg);
