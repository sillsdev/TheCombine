import { Button, GridList, GridListTile, Typography } from "@material-ui/core";
import React, { CSSProperties, useState } from "react";
import { Translate } from "react-localize-redux";

import { Goal, GoalType } from "types/goals";

export type Orientation = "horizontal" | "vertical";

function gridStyle(
  orientation: Orientation,
  size: number,
  scrollVisible: boolean
): CSSProperties {
  switch (orientation) {
    case "horizontal":
      return {
        flexWrap: "nowrap",
        width: size + "vw",
        overflowX: scrollVisible ? "scroll" : "hidden",
        overflowY: "hidden",
      };
    case "vertical":
      return {
        flexWrap: "wrap",
        height: size + "vw",
        overflowX: "auto",
        overflowY: scrollVisible ? "scroll" : "hidden",
        padding: "50px",
      };
  }
}

interface GoalListProps {
  orientation: Orientation;
  data: Goal[];
  size: number;
  numPanes: number;
  scrollToEnd?: boolean;
  handleChange: (goalType: GoalType) => void;
}

export default function GoalList(props: GoalListProps) {
  const [scrollVisible, setScrollVisible] = useState<boolean>(false);
  const tileSize = props.size / 3 - 1.25;

  return (
    <GridList
      style={gridStyle(props.orientation, props.size, scrollVisible)}
      cols={props.orientation === "horizontal" ? props.numPanes : 1}
      onMouseOver={() => setScrollVisible(true)}
      onMouseLeave={() => setScrollVisible(false)}
    >
      {props.data.length > 0
        ? props.data.map((g) =>
            makeGoalTile(tileSize, props.orientation, g, () =>
              props.handleChange(g.goalType)
            )
          )
        : makeGoalTile(tileSize, props.orientation)}
      <div
        ref={(element: HTMLDivElement) => {
          if (props.scrollToEnd && element) element.scrollIntoView(true);
        }}
      />
    </GridList>
  );
}

function buttonStyle(orientation: Orientation, size: number): CSSProperties {
  switch (orientation) {
    case "horizontal":
      return {
        height: "95%",
        padding: "1vw",
        width: size + "vw",
      };
    case "vertical":
      return {
        height: size + "vw",
        padding: "1vw",
        width: "100%",
      };
  }
}

export function makeGoalTile(
  size: number,
  orientation: Orientation,
  goal?: Goal,
  onClick?: () => void
) {
  return (
    <GridListTile key={goal?.guid + orientation} cols={1}>
      <Button
        color="primary"
        variant={goal ? "outlined" : "contained"}
        style={buttonStyle(orientation, size)}
        onClick={onClick}
        disabled={!goal || goal.completed}
      >
        <Typography variant={"h6"}>
          <Translate
            id={goal ? goal.name + ".title" : "goal.selector.noHistory"}
          />
        </Typography>
      </Button>
    </GridListTile>
  );
}
