import {
  Button,
  Grid,
  GridList,
  GridListTile,
  Typography,
} from "@material-ui/core";
import { CSSProperties, useState } from "react";
import { Translate } from "react-localize-redux";

import { Goal, GoalStatus, GoalType } from "types/goals";
import { CharInvChangesGoalList } from "goals/CreateCharInv/CharInvComponent/CharInvCompleted";
import { CreateCharInvChanges } from "goals/CreateCharInv/CreateCharInvTypes";
import { MergesCount } from "goals/MergeDupGoal/MergeDupComponent/MergeDupsCompleted";
import { MergesCompleted } from "goals/MergeDupGoal/MergeDupsTypes";

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
  scrollable: boolean;
  scrollToEnd?: boolean;
  handleChange: (goal: Goal) => void;
}

export default function GoalList(props: GoalListProps): JSX.Element {
  const [scrollVisible, setScrollVisible] = useState<boolean>(false);
  const tileSize = props.size / 3 - 1.25;

  return (
    <GridList
      style={gridStyle(props.orientation, props.size, scrollVisible)}
      cols={props.orientation === "horizontal" ? props.numPanes : 1}
      onMouseOver={
        props.scrollable
          ? () => setScrollVisible(true)
          : () => setScrollVisible(false)
      }
      onMouseLeave={() => setScrollVisible(false)}
    >
      {props.data.length > 0
        ? props.data.map((g) =>
            makeGoalTile(tileSize, props.orientation, g, () =>
              props.handleChange(g)
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
        height: "95%",
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
        disabled={
          /* Hide completed, except goaltypes for which the completed view is implemented. */
          !goal ||
          (goal.status === GoalStatus.Completed &&
            goal.goalType !== GoalType.CreateCharInv &&
            goal.goalType !== GoalType.MergeDups)
        }
      >
        <Grid container direction="column">
          <Grid item>{goal ? GoalInfo(goal) : null}</Grid>
        </Grid>
      </Button>
    </GridListTile>
  );
}

function GoalInfo(goal: Goal): JSX.Element {
  if (goal.status === GoalStatus.Completed) {
    let goalType;
    switch (goal.goalType) {
      case GoalType.CreateCharInv:
        goalType = CharInvChangesGoalList(goal.changes as CreateCharInvChanges);
        break;
      case GoalType.MergeDups:
        goalType = MergesCount(goal.changes as MergesCompleted);
        break;
      default:
        goalType = null;
        break;
    }
    return (
      <Typography variant="h6">
        <Translate
          id={goal ? goal.name + ".title" : "goal.selector.noHistory"}
        />
        {goalType}
      </Typography>
    );
  }
  return (
    <Typography variant="h4">
      <Translate id={goal ? goal.name + ".title" : "goal.selector.noHistory"} />
    </Typography>
  );
}
