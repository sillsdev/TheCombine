import { Box, Grid, Hidden, Typography } from "@material-ui/core";
import React, { ReactElement } from "react";
import { Translate } from "react-localize-redux";

import BottomBar, { bottomBarHeight } from "components/LandingPage/BottomBar";
import LandingButtons, {
  horizontalButtonsHeight,
  SignUpButton,
} from "components/LandingPage/LandingButtons";
import TopBar, { topBarHeight } from "components/LandingPage/TopBar";
import tractor from "resources/tractor.png";
import theme from "types/theme";

const heightBetweenBars =
  window.innerHeight - topBarHeight - bottomBarHeight - theme.spacing(1);

export default function LandingPage(): ReactElement {
  return (
    <React.Fragment>
      <TopBar />
      <Grid container alignItems="flex-start" justifyContent="space-around">
        <Hidden xsDown>
          <Grid item sm md xl>
            <Box style={{ maxHeight: heightBetweenBars, overflow: "auto" }}>
              {body()}
            </Box>
          </Grid>
          <Grid item sm={3} md={2} xl={1}>
            <LandingButtons />
          </Grid>
        </Hidden>
        <Hidden smUp>
          <Grid item xs>
            <LandingButtons top />
          </Grid>
          <Grid item xs>
            <Box
              style={{
                maxHeight: heightBetweenBars - horizontalButtonsHeight,
                overflow: "auto",
              }}
            >
              {body()}
            </Box>
          </Grid>
        </Hidden>
      </Grid>
      <BottomBar />
    </React.Fragment>
  );
}

function body(): ReactElement {
  return (
    <React.Fragment>
      <div style={{ padding: theme.spacing(3) }}>
        <Typography variant="body2" align="justify">
          <Translate id="landingPage.descriptionP1" />
          {<br />}
          {<br />}
          <Translate id="landingPage.descriptionP2" />
          {<br />}
          {<br />}
          <Translate id="landingPage.descriptionP3" />
          {<br />}
        </Typography>
        <Typography
          variant="h6"
          align="justify"
          style={{
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(1),
          }}
        >
          <Translate id="landingPage.descriptionP4" />
        </Typography>
        <SignUpButton buttonIdPrefix="landing-body" />
      </div>
      <img
        src={tractor}
        alt="Tractor"
        style={{
          width: "70%",
          maxWidth: 700,
          margin: "0% 15%",
          marginTop: theme.spacing(4),
        }}
      />
    </React.Fragment>
  );
}
