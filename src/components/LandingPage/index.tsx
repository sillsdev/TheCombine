import { Box, Grid, Hidden, Stack, Typography } from "@mui/material";
import { ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import BottomBar, { bottomBarHeight } from "components/LandingPage/BottomBar";
import LandingButtons, {
  horizontalButtonsHeight,
  SignUpButton,
} from "components/LandingPage/LandingButtons";
import TopBar, { topBarHeight } from "components/LandingPage/TopBar";
import tractor from "resources/tractor.png";
import { Path } from "types/path";
import theme from "types/theme";

const heightBetweenBars =
  window.innerHeight -
  topBarHeight -
  bottomBarHeight -
  parseInt(theme.spacing(1));

export default function LandingPage(): ReactElement {
  const navigate = useNavigate();
  useEffect(() => {
    // If there is an AnnouncementBanner and somebody enters the URL for
    // the LandingPage when displaying page without an AppBar, this
    // prevents banner misalignment.
    navigate(Path.Root);
  }, [navigate]);
  return (
    <>
      <TopBar />
      <Grid container>
        <Hidden smDown>
          <Grid item sm>
            <Box style={{ maxHeight: heightBetweenBars, overflow: "auto" }}>
              <Body />
            </Box>
          </Grid>
          <Grid item sm="auto">
            <LandingButtons />
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
                overflow: "auto",
              }}
            >
              <Body />
            </Box>
          </Grid>
        </Hidden>
      </Grid>
      <BottomBar />
    </>
  );
}

function Body(): ReactElement {
  const { t } = useTranslation();

  return (
    <Stack alignItems="center">
      <div style={{ padding: theme.spacing(3) }}>
        <Typography variant="body2" align="justify">
          {t("landingPage.descriptionP1")}
          {<br />}
          {<br />}
          {t("landingPage.descriptionP2")}
          {<br />}
          {<br />}
          {t("landingPage.descriptionP3")}
          {<br />}
        </Typography>
        <Typography
          variant="h6"
          align="justify"
          style={{ paddingTop: theme.spacing(2) }}
        >
          {t("landingPage.descriptionP4")}
        </Typography>
      </div>
      <SignUpButton buttonIdPrefix="landing-body" />
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
    </Stack>
  );
}
