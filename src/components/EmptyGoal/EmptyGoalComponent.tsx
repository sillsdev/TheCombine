import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate,
} from "react-localize-redux";
import { Typography } from "@material-ui/core";

/**
 * A temporary component that lets users know a goal has not been implemented
 * yet.
 */
class EmptyGoalComponent extends React.Component<LocalizeContextProps> {
  render() {
    return (
      <div className={"emptyGoal"}>
        <Typography variant="h6">
          <Translate id="emptyGoal.message" />
        </Typography>
      </div>
    );
  }
}

export default withLocalize(EmptyGoalComponent);
