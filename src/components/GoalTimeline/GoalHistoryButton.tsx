import { Box, Button, Grid2, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { CharInvChangesGoalList } from "goals/CharacterInventory/CharInvCompleted";
import { CharInvChanges } from "goals/CharacterInventory/CharacterInventoryTypes";
import { MergesCount } from "goals/MergeDuplicates/MergeDupsCompleted";
import { MergesCompleted } from "goals/MergeDuplicates/MergeDupsTypes";
import { EditsCount } from "goals/ReviewEntries/ReviewEntriesCompleted";
import { EntriesEdited } from "goals/ReviewEntries/ReviewEntriesTypes";
import { Goal, GoalName } from "types/goals";
import { goalNameToIcon } from "utilities/goalUtilities";

interface GoalHistoryButtonProps {
  goal: Goal;
  onClick: () => void;
}

export default function GoalHistoryButton(
  props: GoalHistoryButtonProps
): ReactElement {
  const { goal, onClick } = props;
  const { i18n, t } = useTranslation();

  const modifiedFormatted = goal.modified
    ? new Date(goal.modified).toLocaleString(i18n.resolvedLanguage, {
        day: "numeric",
        hour: "numeric",
        hour12: true,
        minute: "2-digit",
        month: "short",
        weekday: "short",
        year: "numeric",
      })
    : null;

  return (
    <Button onClick={onClick} sx={{ minWidth: "225px" }} variant="outlined">
      <Stack
        spacing={1}
        sx={{ alignItems: "flex-start", height: "100%", width: "100%" }}
      >
        {/* Goal name */}
        <Typography sx={{ textAlign: "start" }} variant="h6">
          <Box
            component="span" // to be inline with the title
            sx={{ marginInlineEnd: 1, verticalAlign: "middle" }}
          >
            {goalNameToIcon(goal.name)}
          </Box>
          {t(goal.name + ".title")}
        </Typography>

        {/* Change datetime */}
        {!!goal.modified && (
          <Typography sx={{ textAlign: "start" }} variant="caption">
            {modifiedFormatted}
          </Typography>
        )}

        {/* Change summary */}
        <Grid2 container sx={{ height: "100%", textAlign: "start" }}>
          {goal.changes ? getCompletedGoalInfo(goal) : null}
        </Grid2>
      </Stack>
    </Button>
  );
}

function getCompletedGoalInfo(goal: Goal): ReactElement {
  const { changes, name } = goal;
  switch (name) {
    case GoalName.CreateCharInv:
      return CharInvChangesGoalList(changes as CharInvChanges);
    case GoalName.MergeDups:
    case GoalName.ReviewDeferredDups:
      return MergesCount(changes as MergesCompleted);
    case GoalName.ReviewEntries:
      return EditsCount(changes as EntriesEdited);
    default:
      return <Fragment />;
  }
}
