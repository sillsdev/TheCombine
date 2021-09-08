import { Grid, LinearProgress, Paper, Typography } from "@material-ui/core";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { StoreState } from "types";
import { GoalType } from "types/goals";

/**
 * Displays how much progress has been made in a goal
 */
export default function DisplayProgress() {
  const currentGoal = useSelector(
    (state: StoreState) => state.goalsState.currentGoal
  );
  const currentStep = currentGoal.currentStep;
  const numSteps = currentGoal.numSteps;
  const percentComplete = (currentStep / numSteps) * 100;

  const stepTranslateId =
    currentGoal.goalType === GoalType.MergeDups
      ? "goal.progress.stepMerge"
      : "goal.progress.step";

  return numSteps > 1 ? (
    <Paper key={currentStep}>
      <Grid container direction="column">
        <Grid item xs>
          <Typography variant={"h4"}>
            <Translate id={stepTranslateId} />
            {` ${currentStep + 1} `}
            <Translate id="goal.progress.of" />
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
