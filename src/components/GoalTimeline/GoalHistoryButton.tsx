import { Button, Grid2, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import IconTypography from "components/GoalTimeline/IconTypography";
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
  small?: boolean;
}

export default function GoalHistoryButton(
  props: GoalHistoryButtonProps
): ReactElement {
  const { goal, onClick, small } = props;

  return (
    <Button
      disabled={!goal}
      onClick={onClick}
      sx={{ minWidth: small ? "225px" : "250px" }}
      variant={goal ? "outlined" : "contained"}
    >
      <GoalInfo goal={goal} small={small} />
    </Button>
  );
}

interface GoalInfoProps {
  goal?: Goal;
  small?: boolean;
}

function GoalInfo(props: GoalInfoProps): ReactElement {
  const { goal, small } = props;
  const { t } = useTranslation();

  if (!goal) {
    return <Typography variant="h6">{t("goal.selector.noHistory")}</Typography>;
  }

  return (
    <Stack
      spacing={1}
      sx={{ alignItems: "flex-start", height: "100%", width: "100%" }}
    >
      {/* Goal name */}
      <IconTypography
        icon={goalNameToIcon(goal.name, small ? "small" : "medium")}
        sx={{ textAlign: "start" }}
        variant={small ? "body1" : "h6"}
      >
        {t(goal.name + ".title")}
      </IconTypography>

      {/* Change summary */}
      <Grid2
        container
        sx={{ height: "100%", py: small ? 0 : 1, textAlign: "start" }}
      >
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
