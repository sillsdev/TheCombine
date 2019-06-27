import { GoalProps } from "../../../../types/goals";
import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { AppBar, Toolbar, Typography, Button, Grid } from "@material-ui/core";
import { LogoutButton } from "../../../../components/Login/LogoutButton";

const styles = {
  toolbarButtons: {
    marginLeft: "auto",
    marginRight: -12
  }
};

export class GoalHeaderDisplay extends React.Component<
  GoalProps & LocalizeContextProps
> {
  constructor(props: GoalProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Grid container justify="space-between" spacing={2}>
              <Grid item>
                <Typography variant="h6">
                  <Translate id={"goal.name." + this.props.goal.name} />
                </Typography>
              </Grid>

              <Grid item>
                <LogoutButton />
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default withLocalize(GoalHeaderDisplay);
