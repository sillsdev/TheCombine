import {
  Box,
  Grid,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import HarvestThreshWinnow from "components/HarvestThreshWinnow";
import BottomBar, { bottomBarHeight } from "components/LandingPage/BottomBar";
import LandingButtons, {
  SignUpButton,
  horizontalButtonsHeight,
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
  const isSmUp = useMediaQuery<Theme>((t) => t.breakpoints.up("sm"));
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
        {isSmUp ? (
          <>
            <Grid item sm>
              <Box style={{ maxHeight: heightBetweenBars, overflow: "auto" }}>
                <Body />
              </Box>
            </Grid>
            <Grid item sm="auto">
              <LandingButtons />
            </Grid>
          </>
        ) : (
          <>
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
          </>
        )}
      </Grid>
      <BottomBar />
    </>
  );
}

function Body(): ReactElement {
  const { t } = useTranslation();

  return (
    <Stack alignItems="center" spacing={3}>
      <Box sx={{ p: theme.spacing(3), paddingBottom: 0 }}>
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
        <Typography sx={{ paddingTop: theme.spacing(3) }} variant="h6">
          {t("landingPage.descriptionP4")}
        </Typography>
      </Box>
      <Box>
        <SignUpButton buttonIdPrefix="landing-body" />
      </Box>
      <Box>
        <HarvestThreshWinnow
          height={Math.min(400, (window.innerWidth - verticalButtonsWidth) / 5)}
        />
      </Box>
    </Stack>
  );
}
