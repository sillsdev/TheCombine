import { AppBar, Grid, Hidden, Toolbar, Typography } from "@material-ui/core";
import { Translate } from "react-localize-redux";

import logo from "resources/CombineLogoV1White.png";

/** A  bar shown at the top of the landing page. */
export default function TopBar() {
  return (
    <div className="NavigationBar" style={{ marginBottom: 75 }}>
      <AppBar position="fixed">
        <Toolbar>
          <Grid
            container
            justify="space-between"
            spacing={2}
            alignItems="center"
          >
            <Grid item>
              <img src={logo} height="50" alt="Logo" />
            </Grid>
            <Hidden xsDown>
              <Grid item>
                <Typography variant="h5">
                  <Translate id="landingPage.subtitle" />
                </Typography>
              </Grid>
            </Hidden>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}
