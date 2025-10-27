import { Box, Button, Stack, Typography } from "@mui/material";
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
import { getLocalizedDateTimeString } from "utilities/utilities";

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
    ? getLocalizedDateTimeString(goal.modified, i18n.resolvedLanguage)
    : null;

  return (
    <Button
      onClick={onClick}
      sx={{ alignItems: "flex-start", minWidth: "225px", textAlign: "start" }}
      variant="outlined"
    >
      <Stack spacing={1}>
        {/* Goal name */}
        <Typography variant="h6">
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
          <Typography variant="caption">{modifiedFormatted}</Typography>
        )}

        {/* Change summary */}
        {!!goal.changes && <div>{getCompletedGoalInfo(goal)}</div>}
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
