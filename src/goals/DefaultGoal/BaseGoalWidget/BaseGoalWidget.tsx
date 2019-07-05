import { GoalProps } from "../../../types/goals";
import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Card, CardContent } from "@material-ui/core";

export const WIDTH: number = 200; // Width of each card
const SCALE_FACTOR_FOR_DESELECTED = 0.9; // The percent of regular size that deselected cards shrink to
const DESELECTED_WIDTH: number = WIDTH * SCALE_FACTOR_FOR_DESELECTED; // Width of each not-selected card

class BaseGoalSelect extends React.Component<GoalProps & LocalizeContextProps> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  readonly style = {
    inactiveCard: {
      width: DESELECTED_WIDTH,
      margin: (WIDTH - DESELECTED_WIDTH) / 2,
      backgroundColor: "lightGray",
      color: "gray"
    }
  };

  render() {
    return this.props.goal ? (
      <div className={"GoalWidget" + this.props.goal.id}>
        <Card key={this.props.goal.id} style={this.style.inactiveCard}>
          <CardContent>
            <Translate id={this.props.goal.name + ".title"} />
          </CardContent>
        </Card>
      </div>
    ) : null;
  }
}

export default withLocalize(BaseGoalSelect);
