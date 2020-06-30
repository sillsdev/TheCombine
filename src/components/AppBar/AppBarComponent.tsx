import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import { Grid } from "@material-ui/core";
import UserMenu from "./UserMenu";
import Logo from "./Logo";
import theme from "../../types/theme";
import NavigationButtons from "./NavigationButtons";
import { getProjectId } from "../../backend/localStorage";
import ProjectNameButton from "./ProjectNameButton";
import { CurrentTab } from "../../types/currentTab";

export interface AppBarComponentProps {
  currentTab: CurrentTab;
}

export class AppBarComponent extends React.Component<
  AppBarComponentProps & LocalizeContextProps
> {
  /** An app bar shown at the top of almost every page of The Combine */
  render() {
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
                <Grid item xs>
                  <Logo />
                  {getProjectId() !== "" && (
                    <NavigationButtons currentTab={this.props.currentTab} />
                  )}
                </Grid>
                <Grid item xs>
                  {getProjectId() !== "" && (
                    <ProjectNameButton currentTab={this.props.currentTab} />
                  )}
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
}

export default withLocalize(AppBarComponent);
