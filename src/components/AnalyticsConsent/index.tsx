import { Button, Grid2, Stack, Typography } from "@mui/material";
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

  function ConsentButton(props: {
    onClick: () => void;
    text: string;
  }): ReactElement {
    return (
      <Button
        onClick={props.onClick}
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        spacing={3}
      >
        <div>
          <Typography
            variant="h6"
            style={{ color: themeColors.primary, fontWeight: 600 }}
            gutterBottom
          >
            {t("analyticsConsent.consentModal.title")}
          </Typography>
          <Typography variant="body1">
            {t("analyticsConsent.consentModal.description")}
          </Typography>
        </div>

        <Grid2 container size={{ xs: "auto" }} spacing={1}>
          <ConsentButton
            onClick={acceptAnalytics}
            text={t("analyticsConsent.consentModal.acceptAllBtn")}
          />
          <ConsentButton
            onClick={rejectAnalytics}
            text={t("analyticsConsent.consentModal.acceptNecessaryBtn")}
          />
        </Grid2>
      </Stack>
    </Drawer>
  );
}
