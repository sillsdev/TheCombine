import { GoalProps } from "../../../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { LinearProgress, Paper, Grid, Typography } from "@material-ui/core";

export class DisplayProg extends React.Component<
  GoalProps & LocalizeContextProps
> {
  render() {
    return (
      <Paper key={this.props.goal ? this.props.goal.currentStep : -1}>
        <Grid container direction="column">
          <Grid item xs>
            <Typography variant={"h4"}>{this.getHeaderString()}</Typography>
          </Grid>
          <Grid item xs>
            <LinearProgress
              variant="determinate"
              value={this.getAmountComplete()}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  }

  getAmountComplete(): number {
    if (this.props.goal)
      return (this.props.goal.currentStep / this.props.goal.numSteps) * 100;
    else return 0;
  }

  getHeaderString(): string {
    if (this.props.goal)
      return `${this.props.goal.currentStep} / ${this.props.goal.numSteps}`;
    else return "";
  }
}

export default withLocalize(DisplayProg);
