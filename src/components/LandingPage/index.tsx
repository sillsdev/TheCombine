import { Box, Grid, Hidden, Typography } from "@mui/material";
import { ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import HarvestThreshWinnow from "components/HarvestThreshWinnow";
import BottomBar, { bottomBarHeight } from "components/LandingPage/BottomBar";
import LandingButtons, {
  horizontalButtonsHeight,
  SignUpButton,
  verticalButtonsWidth,
} from "components/LandingPage/LandingButtons";
import TopBar, { topBarHeight } from "components/LandingPage/TopBar";
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
      <Grid container alignItems="flex-start" justifyContent="space-around">
        <Hidden smDown>
          <Grid item sm md xl>
            <Box style={{ maxHeight: heightBetweenBars, overflow: "auto" }}>
              <Body />
            </Box>
          </Grid>
          <Grid item width={verticalButtonsWidth}>
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
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      rowGap={theme.spacing(4)}
      style={{ padding: theme.spacing(3) }}
    >
      <div>
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
      <HarvestThreshWinnow
        maxSize={Math.min(400, (window.innerWidth - verticalButtonsWidth) / 5)}
      />
    </Box>
  );
}
