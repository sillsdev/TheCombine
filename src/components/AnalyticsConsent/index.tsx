import { Button, Grid, Theme, Typography, useMediaQuery } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { themeColors } from "types/theme";

interface ConsentProps {
  onChangeConsent: (consentVal?: boolean) => void;
  required: boolean;
}

export default function AnalyticsConsent(props: ConsentProps): ReactElement {
  const { t } = useTranslation();

  const acceptAnalytics = (): void => props.onChangeConsent(true);
  const rejectAnalytics = (): void => props.onChangeConsent(false);
  const clickedAway = (): void => props.onChangeConsent(undefined);

  const isXs = useMediaQuery<Theme>((th) => th.breakpoints.only("xs"));

  function ConsentButton(props: {
    decision: () => void;
    text: string;
  }): ReactElement {
    return (
      <Button
        onClick={props.decision}
        style={{ height: 60, width: 155 }}
        variant="contained"
      >
        <Typography variant="body2">{props.text}</Typography>
      </Button>
    );
  }

  return (
    <Drawer
      anchor={"bottom"}
      open
      onClose={!props.required ? clickedAway : undefined}
      PaperProps={{ style: { padding: 20 } }}
    >
      <Grid container direction={isXs ? "column" : "row"} alignItems="center">
        <Grid xs>
          <Typography
            variant="h6"
            style={{ color: themeColors.primary, fontWeight: 600 }}
            gutterBottom
          >
            {t("analyticsConsent.consentModal.title")}
          </Typography>
          <Typography variant="body1" style={{ marginRight: 25 }} gutterBottom>
            {t("analyticsConsent.consentModal.description")}
          </Typography>
        </Grid>
        <Grid item container xs="auto" spacing={1}>
          <Grid item>
            <ConsentButton
              decision={acceptAnalytics}
              text={t("analyticsConsent.consentModal.acceptAllBtn")}
            ></ConsentButton>
          </Grid>
          <Grid item>
            <ConsentButton
              decision={rejectAnalytics}
              text={t("analyticsConsent.consentModal.acceptNecessaryBtn")}
            ></ConsentButton>
          </Grid>
        </Grid>
      </Grid>
    </Drawer>
  );
}
