import { AppBar, Hidden, Stack, Toolbar, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import logo from "resources/CombineLogoV1White.png";

export const topBarHeight = 70;

/** A  bar shown at the top of the landing page. */
export default function TopBar(): ReactElement {
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
            <Hidden smDown mdUp>
              <Typography variant="h6">{t("landingPage.subtitle")}</Typography>
            </Hidden>
            <Hidden mdDown>
              <Typography variant="h5">{t("landingPage.subtitle")}</Typography>
            </Hidden>
          </Stack>
        </Toolbar>
      </AppBar>
    </div>
  );
}
