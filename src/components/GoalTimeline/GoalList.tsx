import {
  Button,
  ButtonProps,
  ImageList,
  ImageListItem,
  Typography,
} from "@material-ui/core";
import { CSSProperties, ReactElement, useState } from "react";
import { Translate } from "react-localize-redux";

import { CharInvChangesGoalList } from "goals/CreateCharInv/CharInvComponent/CharInvCompleted";
import { CreateCharInvChanges } from "goals/CreateCharInv/CreateCharInvTypes";
import { MergesCount } from "goals/MergeDupGoal/MergeDupComponent/MergeDupsCompleted";
import { MergesCompleted } from "goals/MergeDupGoal/MergeDupsTypes";
import { Goal, GoalStatus, GoalType } from "types/goals";

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
  completed?: boolean;
  orientation: Orientation;
  data: Goal[];
  size: number;
  numPanes: number;
  scrollable: boolean;
  scrollToEnd?: boolean;
  handleChange: (goal: Goal) => void;
}

export default function GoalList(props: GoalListProps): ReactElement {
  const [scrollVisible, setScrollVisible] = useState<boolean>(false);
  const tileSize = props.size / 3 - 1.25;

  return (
    <ImageList
      style={gridStyle(props.orientation, props.size, scrollVisible)}
      cols={props.orientation === "horizontal" ? props.numPanes : 1}
      onMouseOver={() => setScrollVisible(props.scrollable)}
      onMouseLeave={() => setScrollVisible(false)}
    >
      {props.data.length > 0
        ? props.data.map((g, i) => {
            const buttonProps = {
              id: props.completed
                ? `completed-goal-${i}`
                : `new-goal-${g.name}`,
              onClick: () => props.handleChange(g),
            };
            return makeGoalTile(tileSize, props.orientation, g, buttonProps);
          })
        : makeGoalTile(tileSize, props.orientation)}
      <div
        ref={(element: HTMLDivElement) => {
          if (props.scrollToEnd && element) element.scrollIntoView(true);
        }}
      />
    </ImageList>
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
  buttonProps?: ButtonProps
): ReactElement {
  return (
    <ImageListItem key={goal?.guid + orientation} cols={1}>
      <Button
        {...buttonProps}
        color="primary"
        variant={goal ? "outlined" : "contained"}
        style={buttonStyle(orientation, size)}
        disabled={
          /* Hide completed, except goalTypes for which the completed view is implemented. */
          !goal ||
          (goal.status === GoalStatus.Completed &&
            goal.goalType !== GoalType.CreateCharInv &&
            goal.goalType !== GoalType.MergeDups)
        }
      >
        {goal ? (
          GoalInfo(goal)
        ) : (
          <Typography variant="h6">
            <Translate id="goal.selector.noHistory" />
          </Typography>
        )}
      </Button>
    </ImageListItem>
  );
}

function GoalInfo(goal: Goal): ReactElement {
  if (goal.status === GoalStatus.Completed) {
    let goalInfo;
    switch (goal.goalType) {
      case GoalType.CreateCharInv:
        goalInfo = CharInvChangesGoalList(goal.changes as CreateCharInvChanges);
        break;
      case GoalType.MergeDups:
        goalInfo = MergesCount(goal.changes as MergesCompleted);
        break;
      case GoalType.ReviewEntries:
        goalInfo = null;
        break;
      default:
        goalInfo = null;
        break;
    }
    return (
      <Typography variant="h6">
        <Translate id={goal.name + ".title"} />
        {goalInfo}
      </Typography>
    );
  }
  return (
    <Typography variant="h4">
      <Translate id={goal.name + ".title"} />
    </Typography>
  );
}
