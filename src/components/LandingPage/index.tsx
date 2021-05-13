import { Box, Grid, Hidden, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import BottomBar, { bottomBarHeight } from "components/LandingPage/BottomBar";
import LandingButtons, {
  horizontalButtonsHeight,
} from "components/LandingPage/LandingButtons";
import TopBar, { topBarHeight } from "components/LandingPage/TopBar";
import tractor from "resources/tractor.png";
import theme from "types/theme";

const heightBetweenBars =
  window.visualViewport.height - topBarHeight - bottomBarHeight;

export default function LandingPage() {
  return (
    <React.Fragment>
      <TopBar />
      <Grid container direction="row-reverse" justify="space-around">
        <Hidden xsDown>
          <Grid item sm md lg xl justify="flex-end" style={{ width: "100%" }}>
            <LandingButtons />
          </Grid>
          <Grid item sm={8} md={9} lg={10} xl={11}>
            <Box style={{ maxHeight: heightBetweenBars, overflow: "scroll" }}>
              {body()}
            </Box>
          </Grid>
        </Hidden>
        <Hidden smUp>
          <Grid item xs={12}>
            <LandingButtons top />
          </Grid>
          <Grid item xs={12}>
            <Box
              style={{
                maxHeight: heightBetweenBars - horizontalButtonsHeight,
                overflow: "scroll",
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

function body() {
  return (
    <React.Fragment>
      <Typography variant={"body2"} style={{ margin: theme.spacing(3) }}>
        <Translate id="landingPage.descriptionP1" />
        {<br />}
        {<br />}
        <Translate id="landingPage.descriptionP2" />
        {<br />}
        {<br />}
        <Translate id="landingPage.descriptionP3" />
      </Typography>
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
