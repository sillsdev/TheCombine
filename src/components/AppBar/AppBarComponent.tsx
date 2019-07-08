import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import { Grid } from "@material-ui/core";
import { LogoutButton } from "../Login/LogoutButton";
import { GoToHomeButton } from "../GoToHomeButton/GoToHomeButtonComponent";

/** An app bar shown at the top of almost every page of The Combine */
export class AppBarComponent extends React.Component<LocalizeContextProps> {
  render() {
    return (
      <div className="NavigationBar">
        <AppBar position="static">
          <Toolbar>
            <Grid
              container
              justify="space-between"
              spacing={2}
              alignItems="center"
            >
              <Grid item>
                <GoToHomeButton />
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
