import { Box, IconButton, Toolbar, Typography } from "@material-ui/core";
import { Cancel } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";

import * as backend from "backend";
import { getClosedBanner, setClosedBanner } from "backend/localStorage";
import { Path } from "browserHistory";
import { topBarHeight } from "components/LandingPage/TopBar";
import theme, { themeColors } from "types/theme";

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<string>("");

  useEffect(() => {
    const getBanner = async () => {
      const text = (await backend.getBanner()).announcement;
      if (text && text !== getClosedBanner()) {
        setBanner(text);
      }
    };
    getBanner();
  }, []);

  function closeBanner() {
    setClosedBanner(banner);
    setBanner("");
  }

  // Adust the margins depending on whether there is an AppBar.
  const loc = useLocation().pathname;
  const isBelowAppBar = loc === Path.Root || loc.startsWith(Path.ProjScreen);
  const margins = isBelowAppBar
    ? { marginTop: topBarHeight, marginBottom: -topBarHeight }
    : {};

  return (
    <React.Fragment>
      {!!banner && (
        <Toolbar style={{ ...margins, backgroundColor: themeColors.warn }}>
          <IconButton onClick={closeBanner}>
            <Cancel />
          </IconButton>
          <Box sx={{ width: theme.spacing(2) }} />
          <Typography>{banner}</Typography>
        </Toolbar>
      )}
    </React.Fragment>
  );
}
