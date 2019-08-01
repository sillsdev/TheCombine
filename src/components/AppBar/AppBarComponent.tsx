import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import { Grid } from "@material-ui/core";
import UserMenu from "./UserMenu";
import GoToHomeButton from "../GoToHomeButton/GoToHomeButtonComponent";
import theme from "../../types/theme";

/** An app bar shown at the top of almost every page of The Combine */
export class AppBarComponent extends React.Component<LocalizeContextProps> {
  render() {
    return (
      <div className="NavigationBar" style={{ marginBottom: 64 }}>
        <AppBar position="fixed" style={{ zIndex: theme.zIndex.drawer + 1 }}>
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
                <UserMenu />
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default withLocalize(AppBarComponent);
