import { Cancel } from "@mui/icons-material";
import { Box, IconButton, Toolbar, Typography } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";

import { BannerType } from "api/models";
import { getBannerText } from "backend";
import { getClosedBanner, setClosedBanner } from "backend/localStorage";
import { topBarHeight } from "components/LandingPage/TopBar";
import { StoreState } from "types";
import { useAppSelector } from "types/hooks";
import { Path } from "types/path";
import theme, { themeColors } from "types/theme";

interface MarginType {
  marginTop?: number;
  marginBottom?: number;
}

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<string>("");
  const [margins, setMargins] = useState<MarginType>({});

  // Adjust the margins depending on whether there is an AppBar.
  const loc = useAppSelector(
    (state: StoreState) => state.analyticsState.currentPage
  );

  const calculateMargins = useCallback((): MarginType => {
    return loc === Path.Root || loc.startsWith(Path.AppRoot)
      ? { marginTop: topBarHeight, marginBottom: -topBarHeight }
      : {};
  }, [loc]);

  // Check for announcement banner on (re)load or navigation to a new page.
  useEffect(() => {
    setMargins(calculateMargins());
    getBannerText(BannerType.Announcement).then((text) => {
      setBanner(text !== getClosedBanner() ? text : "");
    });
  }, [loc, calculateMargins]);

  function closeBanner() {
    setClosedBanner(banner);
    setBanner("");
  }

  return (
    <React.Fragment>
      {!!banner && (
        <Toolbar
          style={{
            ...margins,
            backgroundColor: themeColors.warn,
          }}
        >
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
