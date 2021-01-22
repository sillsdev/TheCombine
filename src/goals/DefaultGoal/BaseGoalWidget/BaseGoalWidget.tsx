import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate,
} from "react-localize-redux";
import { Card, CardContent } from "@material-ui/core";

import { GoalProps } from "types/goals";

// Width of each card
export const WIDTH = 200;

// The percent of regular size that deselected cards shrink to
const SCALE_FACTOR_FOR_DESELECTED = 0.9;

// Width of each not-selected card
const DESELECTED_WIDTH = WIDTH * SCALE_FACTOR_FOR_DESELECTED;

class BaseGoalSelect extends React.Component<GoalProps & LocalizeContextProps> {
  readonly style = {
    inactiveCard: {
      width: DESELECTED_WIDTH,
      margin: (WIDTH - DESELECTED_WIDTH) / 2,
      backgroundColor: "lightGray",
      color: "gray",
    },
  };

  render() {
    return this.props.goal ? (
      <div className={"GoalWidget" + this.props.goal.goalType}>
        <Card key={this.props.goal.goalType} style={this.style.inactiveCard}>
          <CardContent>
            <Translate id={this.props.goal.name + ".title"} />
          </CardContent>
        </Card>
      </div>
    ) : null;
  }
}

export default withLocalize(BaseGoalSelect);
