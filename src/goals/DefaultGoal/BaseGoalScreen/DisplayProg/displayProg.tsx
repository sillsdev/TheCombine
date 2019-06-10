import { GoalProps } from "../../../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

import LinearProgress from "@material-ui/core/LinearProgress";

export class DisplayProg extends React.Component<
  GoalProps & LocalizeContextProps
> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <LinearProgress
          value={
            ((this.props.goal.curNdx + 1) / this.props.goal.steps.length) * 100
          }
        />
      </div>
    );
  }
}

export default withLocalize(DisplayProg);
