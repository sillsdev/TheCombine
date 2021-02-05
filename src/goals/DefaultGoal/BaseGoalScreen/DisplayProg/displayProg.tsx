import { Grid, LinearProgress, Paper, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

interface ProgressProps {
  currentStep: number;
  numSteps: number;
}

/**
 * Displays how much progress has been made in a goal
 */
export default class DisplayProg extends React.Component<ProgressProps> {
  render() {
    return this.props.numSteps > 1 ? (
      <Paper key={this.props.currentStep}>
        <Grid container direction="column">
          <Grid item xs>
            <Typography variant={"h4"}>
              <Translate id="goal.progress.step" />
              {` ${this.props.currentStep + 1} `}
              <Translate id="goal.progress.of" />
              {` ${this.props.numSteps}`}
            </Typography>
          </Grid>
          <Grid item xs>
            <LinearProgress
              variant="determinate"
              value={this.getAmountComplete()}
            />
          </Grid>
        </Grid>
      </Paper>
    ) : null;
  }

  getAmountComplete(): number {
    return (this.props.currentStep / this.props.numSteps) * 100;
  }

  getHeaderString(): string {
    return `${this.props.currentStep} / ${this.props.numSteps}`;
  }
}
