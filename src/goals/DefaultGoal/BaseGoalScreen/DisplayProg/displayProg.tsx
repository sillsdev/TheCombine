import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { LinearProgress, Paper, Grid, Typography } from "@material-ui/core";

interface ProgressProps {
  currentStep: number;
  numSteps: number;
}

export class DisplayProg extends React.Component<
  ProgressProps & LocalizeContextProps
> {
  render() {
    return this.props.numSteps > 1 ? (
      <Paper key={this.props.currentStep}>
        <Grid container direction="column">
          <Grid item xs>
            <Typography variant={"h4"}>
              <Translate id="goal.progress.step" />
              {` ${this.props.currentStep} `}
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

export default withLocalize(DisplayProg);
