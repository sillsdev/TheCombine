import {
  Button,
  ButtonProps,
  ImageList,
  ImageListItem,
  Typography,
} from "@mui/material";
import { CSSProperties, Fragment, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { CharInvChangesGoalList } from "goals/CharacterInventory/CharInvCompleted";
import { CharInvChanges } from "goals/CharacterInventory/CharacterInventoryTypes";
import { MergesCount } from "goals/MergeDuplicates/MergeDupsCompleted";
import { MergesCompleted } from "goals/MergeDuplicates/MergeDupsTypes";
import { EditsCount } from "goals/ReviewEntries/ReviewEntriesCompleted";
import { EntriesEdited } from "goals/ReviewEntries/ReviewEntriesTypes";
import { Goal, GoalStatus, GoalType } from "types/goals";

type Orientation = "horizontal" | "vertical";

function gridStyle(
  orientation: Orientation,
  size: number,
  scrollVisible?: boolean
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
  recommendFirst?: boolean;
  scrollable?: boolean;
  scrollToEnd?: boolean;
  handleChange: (goal: Goal) => void;
}

export default function GoalList(props: GoalListProps): ReactElement {
  const [scrollVisible, setScrollVisible] = useState<boolean | undefined>();
  const tileSize = props.size / 3 - 1.25;

  const id = (g: Goal): string =>
    props.completed ? `completed-goal-${g.guid}` : `new-goal-${g.name}`;

  return (
    <ImageList
      style={gridStyle(props.orientation, props.size, scrollVisible)}
      cols={props.orientation === "horizontal" ? props.numPanes : 1}
      onMouseOver={() => setScrollVisible(props.scrollable)}
      onMouseLeave={() => setScrollVisible(false)}
    >
      {props.data.length > 0 ? (
        props.data.map((g, i) => (
          <GoalTile
            buttonProps={{ id: id(g), onClick: () => props.handleChange(g) }}
            goal={g}
            key={g.guid || g.name}
            orientation={props.orientation}
            recommended={props.recommendFirst && i === 0}
            size={tileSize}
          />
        ))
      ) : (
        <GoalTile size={tileSize} orientation={props.orientation} />
      )}
      <div
        ref={(element: HTMLDivElement) => {
          if (props.scrollToEnd && element) {
            element.scrollIntoView(true);
          }
        }}
      />
    </ImageList>
  );
}

function buttonStyle(orientation: Orientation, size: number): CSSProperties {
  switch (orientation) {
    case "horizontal":
      return { height: "95%", padding: "1vw", width: size + "vw" };
    case "vertical":
      return { height: "95%", padding: "1vw", width: "100%" };
  }
}

interface GoalTileProps {
  buttonProps?: ButtonProps & { "data-testid"?: string };
  goal?: Goal;
  orientation: Orientation;
  recommended?: boolean;
  size: number;
}

function GoalTile(props: GoalTileProps): ReactElement {
  const goal = props.goal;
  return (
    <ImageListItem cols={1}>
      <Button
        {...props.buttonProps}
        color={props.recommended ? "secondary" : "primary"}
        variant={goal ? "outlined" : "contained"}
        style={{
          ...buttonStyle(props.orientation, props.size),
          border: props.recommended ? "2px solid #f50057" : undefined,
          boxShadow: props.recommended ? "0 0 8px #f50057" : undefined,
        }}
      >
        <GoalInfo goal={goal} />
      </Button>
    </ImageListItem>
  );
}

interface GoalInfoProps {
  goal?: Goal;
}

function GoalInfo(props: GoalInfoProps): ReactElement {
  const { t } = useTranslation();

  const goal = props.goal;
  if (!goal) {
    return <Typography variant="h6">{t("goal.selector.noHistory")}</Typography>;
  }

  if (goal.status === GoalStatus.Completed) {
    return (
      <Typography variant="h6">
        {t(goal.name + ".title")}
        {getCompletedGoalInfo(goal)}
      </Typography>
    );
  }

  return <Typography variant="h4">{t(goal.name + ".title")}</Typography>;
}

function getCompletedGoalInfo(goal: Goal): ReactElement {
  switch (goal.goalType) {
    case GoalType.CreateCharInv:
      return CharInvChangesGoalList(goal.changes as CharInvChanges);
    case GoalType.MergeDups:
    case GoalType.ReviewDeferredDups:
      return MergesCount(goal.changes as MergesCompleted);
    case GoalType.ReviewEntries:
      return EditsCount(goal.changes as EntriesEdited);
    default:
      return <Fragment />;
  }
}
