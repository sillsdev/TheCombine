import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import {
  withLocalize,
  LocalizeContextProps,
  Translate
} from "react-localize-redux";
import { Grid, Typography } from "@material-ui/core";
import { LogoutButton } from "../Login/LogoutButton";

export interface AppBarProps {
  title: string;
}

/** The navigation bar provides the UI for navigating around The Combine. */
export class AppBarComponent extends React.Component<
  AppBarProps & LocalizeContextProps
> {
  constructor(props: AppBarProps & LocalizeContextProps) {
    super(props);
  }

  // Render the different UI elements in the nav bar based on this
  // component's props
  render() {
    return (
      <div className="NavigationBar">
        <AppBar position="static">
          <Toolbar>
            <Grid container justify="space-between" spacing={2}>
              <Grid item>
                <Typography variant="h6">
                  <Translate id={this.props.title + ".title"} />
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

export default withLocalize(AppBarComponent);
