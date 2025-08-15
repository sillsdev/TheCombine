import { LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { type StoreState } from "rootRedux/types";
import { GoalType } from "types/goals";

/**
 * Displays how much progress has been made in a goal
 */
export default function DisplayProgress(): ReactElement | null {
  /* We cannot use a single selector for state.goalsState.currentGoal and define everything on that;
 currentStep needs its own targeted selector for it to re-render as the user progresses. */
  const currentStep = useSelector(
    (state: StoreState) => state.goalsState.currentGoal.currentStep
  );
  const numSteps = useSelector(
    (state: StoreState) => state.goalsState.currentGoal.numSteps
  );
  const goalType = useSelector(
    (state: StoreState) => state.goalsState.currentGoal.goalType
  );
  const { t } = useTranslation();

  const percentComplete = (currentStep / numSteps) * 100;
  const stepTranslateId =
    goalType === GoalType.MergeDups || goalType === GoalType.ReviewDeferredDups
      ? "goal.progressMerge"
      : "goal.progress";

  return numSteps > 1 ? (
    <Paper>
      <Stack>
        <Typography variant={"h4"}>
          {t(stepTranslateId, { val1: currentStep + 1, val2: numSteps })}
        </Typography>

        <LinearProgress value={percentComplete} variant="determinate" />
      </Stack>
    </Paper>
  ) : null;
}
