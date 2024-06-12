import { Cancel } from "@mui/icons-material";
import { Box, IconButton, Toolbar, Typography } from "@mui/material";
import {
  CSSProperties,
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { BannerType } from "api/models";
import { getBannerText } from "backend";
import { getClosedBanner, setClosedBanner } from "backend/localStorage";
import { topBarHeight } from "components/LandingPage/TopBar";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { Path } from "types/path";
import theme from "types/theme";

export default function AnnouncementBanner(): ReactElement {
  const [banner, setBanner] = useState<string>("");
  const [margins, setMargins] = useState<CSSProperties>({});

  // Adjust the margins depending on whether there is an AppBar.
  const loc = useAppSelector(
    (state: StoreState) => state.analyticsState.currentPage
  );

  const calculateMargins = useCallback((): CSSProperties => {
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

  function closeBanner(): void {
    setClosedBanner(banner);
    setBanner("");
  }

  return banner ? (
    <Toolbar
      sx={{ ...margins, backgroundColor: (t) => t.palette.warning.main }}
    >
      <IconButton onClick={closeBanner} size="large">
        <Cancel />
      </IconButton>
      <Box sx={{ width: theme.spacing(2) }} />
      <Typography>{banner}</Typography>
    </Toolbar>
  ) : (
    <Fragment />
  );
}
