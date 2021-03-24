import { Grid, LinearProgress, Paper, Typography } from "@material-ui/core";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { StoreState } from "types";

/**
 * Displays how much progress has been made in a goal
 */
export default function DisplayProgress() {
  const goal = useSelector((state: StoreState) => state.goalsState.currentGoal);

  function getAmountComplete(): number {
    return (goal.currentStep / goal.numSteps) * 100;
  }

  /*function getHeaderString(): string {
    return `${goal.currentStep} / ${goal.numSteps}`;
  }*/

  return goal.numSteps > 1 ? (
    <Paper key={goal.currentStep}>
      <Grid container direction="column">
        <Grid item xs>
          <Typography variant={"h4"}>
            <Translate id="goal.progress.step" />
            {` ${goal.currentStep + 1} `}
            <Translate id="goal.progress.of" />
            {` ${goal.numSteps}`}
          </Typography>
        </Grid>
        <Grid item xs>
          <LinearProgress variant="determinate" value={getAmountComplete()} />
        </Grid>
      </Grid>
    </Paper>
  ) : null;
}
