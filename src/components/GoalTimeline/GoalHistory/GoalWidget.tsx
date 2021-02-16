import { Card, CardContent } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import { GoalProps } from "types/goals";

// Width of each card
const WIDTH = 200;
// The percent of regular size that deselected cards shrink to
const SCALE_FACTOR_FOR_DESELECTED = 0.9;
// Width of each not-selected card
const DESELECTED_WIDTH = WIDTH * SCALE_FACTOR_FOR_DESELECTED;

export default function GoalWidget(props: GoalProps) {
  const style = {
    inactiveCard: {
      width: DESELECTED_WIDTH,
      margin: (WIDTH - DESELECTED_WIDTH) / 2,
      backgroundColor: "lightGray",
      color: "gray",
    },
  };

  return props.goal ? (
    <div className={"GoalWidget" + props.goal.goalType}>
      <Card key={props.goal.goalType} style={style.inactiveCard}>
        <CardContent>
          <Translate id={props.goal.name + ".title"} />
        </CardContent>
      </Card>
    </div>
  ) : null;
}
