import { AppBar, Grid, Hidden, Toolbar, Typography } from "@material-ui/core";
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
          <Grid
            container
            justifyContent="space-between"
            spacing={2}
            alignItems="center"
          >
            <Grid item>
              <img src={logo} height="50" alt="Logo" />
            </Grid>
            <Hidden xsDown>
              <Grid item>
                <Typography variant="h5">
                  {t("landingPage.subtitle")}
                </Typography>
              </Grid>
            </Hidden>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}
