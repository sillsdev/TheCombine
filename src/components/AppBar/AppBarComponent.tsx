import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import { Grid } from "@material-ui/core";
import { LogoutButton } from "../Login/LogoutButton";
import logo from "../../resources/CombineLogoV1.png";

/** An app bar shown at the top of almost every page of The Combine */
export class AppBarComponent extends React.Component<LocalizeContextProps> {
  constructor(props: LocalizeContextProps) {
    super(props);
  }

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
              <Grid item xs={10}>
                <img src={logo} width="15%" alt="Logo" />
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
