import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { withLocalize } from "react-localize-redux";
import { Grid } from "@material-ui/core";
import UserMenu from "./UserMenu";
import Logo from "./Logo";
import theme from "../../types/theme";
import NavigationButtons from "./NavigationButtons";
import { getProjectId } from "../../backend/localStorage";

/** An app bar shown at the top of almost every page of The Combine */
function AppBarComponent() {
  return (
    <React.Fragment>
      <div
        className="NavigationBar"
        style={{ marginBottom: theme.spacing(12) }}
      >
        <AppBar position="fixed" style={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Grid
              container
              justify="space-between"
              spacing={2}
              alignItems="center"
            >
              <Grid item>
                <Logo />
                {getProjectId() !== "" && <NavigationButtons />}
              </Grid>
              <Grid item>
                <UserMenu />
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </div>
    </React.Fragment>
  );
}

export default withLocalize(AppBarComponent);