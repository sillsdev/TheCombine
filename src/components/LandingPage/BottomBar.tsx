import { AppBar, Button, Grid, Toolbar, Typography } from "@material-ui/core";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { RuntimeConfig } from "types/runtimeConfig";

export const bottomBarHeight = 55;

/** A  bar shown at the bottom of the landing page. */
export default function BottomBar(): ReactElement {
  const { t } = useTranslation();
  const combineAppRelease = RuntimeConfig.getInstance().appRelease();
  
  return (
    <div style={{ marginTop: bottomBarHeight }}>
      <AppBar
        position="fixed"
        style={{
          top: "auto",
          bottom: 0,
        }}
      >
        <Toolbar variant="dense">
          <Grid
            container
            justifyContent="space-between"
            spacing={2}
            alignItems="center"
          >
            <Grid item>
              <Typography variant="caption">{combineAppRelease}</Typography>
            </Grid>
            <Grid item>
              <Button
                size="small"
                color="inherit"
                onClick={() =>
                  window.open(
                    "https://software.sil.org/language-software-privacy-policy/"
                  )
                }
                id="privacy-policy"
              >
                <Typography variant="caption">
                  {t("landingPage.privacyPolicy")}
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}
