import { GoalProps } from "../../types/goals";
import React from "react";
import { Translate } from "react-localize-redux";
import { Card, CardContent } from "@material-ui/core";

export const WIDTH: number = 200; // Width of each card
const SCALE_FACTOR_FOR_DESELECTED = 0.9; // The percent of regular size that deselected cards shrink to
const DESELECTED_WIDTH: number = WIDTH * SCALE_FACTOR_FOR_DESELECTED; // Width of each not-selected card

export default function BaseGoalSelect(props: GoalProps) {
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
