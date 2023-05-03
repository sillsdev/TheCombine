import { Cancel } from "@mui/icons-material";
import { Box, IconButton, Toolbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { BannerType } from "api/models";
import { getBannerText } from "backend";
import { getClosedBanner, setClosedBanner } from "backend/localStorage";
import { Path } from "browserHistory";
import { topBarHeight } from "components/LandingPage/TopBar";
import theme, { themeColors } from "types/theme";

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<string>("");

  // Adjust the margins depending on whether there is an AppBar.
  const loc = useLocation().pathname;
  const isBelowAppBar = loc === Path.Root || loc.startsWith(Path.ProjScreen);
  const margins = isBelowAppBar
    ? { marginTop: topBarHeight, marginBottom: -topBarHeight }
    : {};

  // Check for announcement banner on (re)load or navigation to a new page.
  useEffect(() => {
    getBannerText(BannerType.Announcement).then((text) => {
      console.info(`Got banner: ${text}`);
      setBanner(text !== getClosedBanner() ? text : "");
    });
  }, [loc, setBanner]);

  function closeBanner() {
    setClosedBanner(banner);
    setBanner("");
  }

  return (
    <React.Fragment>
      {!!banner && (
        <Toolbar style={{ ...margins, backgroundColor: themeColors.warn }}>
          <IconButton onClick={closeBanner} size="large">
            <Cancel />
          </IconButton>
          <Box sx={{ width: theme.spacing(2) }} />
          <Typography>{banner}</Typography>
        </Toolbar>
      )}
    </React.Fragment>
  );
}
