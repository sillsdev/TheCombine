import { Button, Grid2, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { CharInvChangesGoalList } from "goals/CharacterInventory/CharInvCompleted";
import { CharInvChanges } from "goals/CharacterInventory/CharacterInventoryTypes";
import { MergesCount } from "goals/MergeDuplicates/MergeDupsCompleted";
import { MergesCompleted } from "goals/MergeDuplicates/MergeDupsTypes";
import { EditsCount } from "goals/ReviewEntries/ReviewEntriesCompleted";
import { EntriesEdited } from "goals/ReviewEntries/ReviewEntriesTypes";
import { Goal, GoalType } from "types/goals";
import { goalNameToIcon } from "utilities/goalUtilities";

interface GoalHistoryButtonProps {
  goal?: Goal;
  onClick?: () => void;
}

export default function GoalHistoryButton(
  props: GoalHistoryButtonProps
): ReactElement {
  const { onClick, goal } = props;
  return (
    <Button
      disabled={!goal}
      onClick={onClick}
      sx={{ minWidth: "350px" }}
      variant={goal ? "outlined" : "contained"}
    >
      <GoalInfo goal={goal} />
    </Button>
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

  return (
    <Stack sx={{ height: "100%", width: "100%" }}>
      <Grid2 alignItems="center" container justifyContent="space-between">
        {goalNameToIcon(goal.name)}
        <Typography variant="h6">{t(goal.name + ".title")}</Typography>
        <div />
      </Grid2>
      <Grid2 container alignContent="center" sx={{ height: "100%" }}>
        {goal.changes ? getCompletedGoalInfo(goal) : null}
      </Grid2>
    </Stack>
  );
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
