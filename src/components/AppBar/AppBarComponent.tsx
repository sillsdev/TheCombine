import { AppBar, Grid, Toolbar } from "@material-ui/core";
import React from "react";

import { getProjectId } from "backend/localStorage";
import { Path } from "browserHistory";
import theme from "types/theme";
import DownloadButton from "components/ProjectExport/DownloadButton";
import Logo from "components/AppBar/Logo";
import NavigationButtons from "components/AppBar/NavigationButtons";
import ProjectNameButton from "components/AppBar/ProjectNameButton";
import UserMenu from "components/AppBar/UserMenu";

interface AppBarComponentProps {
  currentTab: Path;
}

/** An app bar shown at the top of all logged in pages */
export default function AppBarComponent(props: AppBarComponentProps) {
  return (
    <div className="NavigationBar" style={{ marginBottom: theme.spacing(12) }}>
      <AppBar position="fixed" style={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Grid
            container
            justify="space-between"
            spacing={2}
            alignItems="center"
          >
            <Grid item xs>
              <Logo />
              {getProjectId() !== "" && (
                <NavigationButtons currentTab={props.currentTab} />
              )}
            </Grid>
            <Grid item xs>
              {getProjectId() !== "" && (
                <ProjectNameButton currentTab={props.currentTab} />
              )}
            </Grid>
            <Grid item>
              <DownloadButton colorSecondary />
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
