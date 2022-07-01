import { Grid, LinearProgress, Paper, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { StoreState } from "types";
import { GoalType } from "types/goals";

/**
 * Displays how much progress has been made in a goal
 */
export default function DisplayProgress() {
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
    goalType === GoalType.MergeDups
      ? "goal.progress.stepMerge"
      : "goal.progress.step";

  return numSteps > 1 ? (
    <Paper key={currentStep}>
      <Grid container direction="column">
        <Grid item xs>
          <Typography variant={"h4"}>
            {t(stepTranslateId)}
            {` ${currentStep + 1} `}
            {t("goal.progress.of")}
            {` ${numSteps}`}
          </Typography>
        </Grid>
        <Grid item xs>
          <LinearProgress variant="determinate" value={percentComplete} />
        </Grid>
      </Grid>
    </Paper>
  ) : null;
}
