import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import BottomBar from "components/LandingPage/BottomBar";
import LandingButtons from "components/LandingPage/LandingButtons";
import TopBar from "components/LandingPage/TopBar";
import tractor from "resources/tractor.png";
import theme from "types/theme";

export default function LandingPage() {
  return (
    <React.Fragment>
      <TopBar />
      <Grid container direction="row-reverse" justify="space-around">
        <Grid item xs={12} sm md lg xl>
          <LandingButtons />
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={10} xl={11}>
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
        </Grid>
      </Grid>
      <BottomBar />
    </React.Fragment>
  );
}
