import {
  AppBar,
  Stack,
  Theme,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import logo from "resources/CombineLogoV1White.png";

export const topBarHeight = 70;

/** A  bar shown at the top of the landing page. */
export default function TopBar(): ReactElement {
  const showSubtitle = useMediaQuery<Theme>((th) => th.breakpoints.up("sm"));
  const isMdUp = useMediaQuery<Theme>((th) => th.breakpoints.up("md"));
  const { t } = useTranslation();

  return (
    <div className="NavigationBar" style={{ marginBottom: topBarHeight }}>
      <AppBar position="fixed">
        <Toolbar>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={2}
            style={{ width: "100%" }}
          >
            <img src={logo} height="50" alt="Logo" />
            {showSubtitle && (
              <Typography variant={isMdUp ? "h5" : "h6"}>
                {t("landingPage.subtitle")}
              </Typography>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
    </div>
  );
}
