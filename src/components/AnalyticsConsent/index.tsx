import { Button, Grid, Theme, Typography, useMediaQuery } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { themeColors } from "types/theme";

interface ConsentProps {
  onChangeConsent: (consentVal: boolean | undefined) => void;
  required: boolean;
}

export default function AnalyticsConsent(props: ConsentProps): ReactElement {
  const { t } = useTranslation();

  const acceptAnalytics = (): void => {
    props.onChangeConsent(true);
  };
  const rejectAnalytics = (): void => {
    props.onChangeConsent(false);
  };

  const clickedAway = (): void => {
    props.onChangeConsent(undefined);
  };

  const isXs = useMediaQuery<Theme>((th) => th.breakpoints.only("xs"));

  return (
    <div>
      <Drawer
        anchor={"bottom"}
        open
        onClose={!props.required ? clickedAway : undefined}
      >
        <div style={{ padding: 20 }}>
          <Grid
            container
            direction={isXs ? "column" : "row"}
            justifyContent="space-around"
            alignItems="center"
            spacing={0}
          >
            <Grid item xs>
              <Typography
                variant="h6"
                style={{ color: themeColors.primary, fontWeight: 600 }}
                gutterBottom
              >
                {t("analyticsConsent.consentModal.title")}
              </Typography>
              <Typography
                variant="body1"
                align="left"
                style={{ marginRight: 25 }}
                gutterBottom
              >
                {t("analyticsConsent.consentModal.description")}
              </Typography>
            </Grid>
            <Grid
              container
              xs="auto"
              display="flex"
              justifyContent="space-around"
              alignItems="center"
              spacing={1}
            >
              <Grid item>
                <Button
                  onClick={acceptAnalytics}
                  style={{
                    height: 60,
                    width: 155,
                  }}
                  variant={"contained"}
                >
                  <Typography variant="body2">
                    {t("analyticsConsent.consentModal.acceptAllBtn")}
                  </Typography>
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={rejectAnalytics}
                  style={{
                    height: 60,
                    width: 155,
                  }}
                  variant={"contained"}
                >
                  <Typography variant="body2">
                    {t("analyticsConsent.consentModal.acceptNecessaryBtn")}
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Drawer>
    </div>
  );
}
