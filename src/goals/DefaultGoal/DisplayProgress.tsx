import { Grid, LinearProgress, Paper, Typography } from "@material-ui/core";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { StoreState } from "types";

/**
 * Displays how much progress has been made in a goal
 */
export default function DisplayProgress() {
  const currentStep = useSelector(
    (state: StoreState) => state.goalsState.currentGoal.currentStep
  );
  const numSteps = useSelector(
    (state: StoreState) => state.goalsState.currentGoal.numSteps
  );
  const percentComplete = (currentStep / numSteps) * 100;

  return numSteps > 1 ? (
    <Paper key={currentStep}>
      <Grid container direction="column">
        <Grid item xs>
          <Typography variant={"h4"}>
            <Translate id="goal.progress.step" />
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
