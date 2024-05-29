import { AppBar, Button, Stack, Toolbar, Typography } from "@mui/material";
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
        style={{ bottom: 0, maxHeight: bottomBarHeight, top: "auto" }}
      >
        <Toolbar variant="dense">
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={1}
            style={{ width: "100%" }}
          >
            <Typography variant="caption">{combineAppRelease}</Typography>
            <Button
              size="small"
              color="inherit"
              onClick={() =>
                window.open(
                  "https://software.sil.org/language-software-privacy-policy/"
                )
              }
              id="privacy-policy"
              style={{ margin: 0 }}
            >
              <Typography variant="caption">
                {t("landingPage.privacyPolicy")}
              </Typography>
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
    </div>
  );
}
