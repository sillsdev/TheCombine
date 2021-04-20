import { AppBar, Button, Grid, Toolbar, Typography } from "@material-ui/core";
import { Translate } from "react-localize-redux";

import history, { Path } from "browserHistory";

/** A  bar shown at the bottom of the landing page. */
export default function BottomBar() {
  const { REACT_APP_VERSION } = process.env;
  return (
    <div style={{ marginTop: 60 }}>
      <AppBar
        position="fixed"
        style={{
          top: "auto",
          bottom: 0,
        }}
      >
        <Toolbar variant="dense">
          <Grid
            container
            justify="space-between"
            spacing={2}
            alignItems="center"
          >
            <Grid item>
              <Typography variant="caption">v{REACT_APP_VERSION}</Typography>
            </Grid>
            <Grid item>
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  history.push(Path.PrivacyPolicy);
                }}
              >
                <Typography variant="caption">
                  <Translate id="landingPage.privacyPolicy" />
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}
