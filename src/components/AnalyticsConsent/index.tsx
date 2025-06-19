import { Button, Grid2, Stack, Typography } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

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
        sx={{ height: 60, width: 155 }}
        variant="contained"
      >
        <Typography variant="body2">{props.text}</Typography>
      </Button>
    );
  }

  return (
    <Drawer
      anchor="bottom"
      open
      onClose={props.required ? undefined : clickedAway}
      slotProps={{ paper: { sx: { p: 2 } } }}
    >
      <Stack
        alignItems="center"
        direction={{ sm: "row", xs: "column" }}
        spacing={2}
      >
        {/* Consent texts */}
        <div>
          <Typography
            variant="h6"
            sx={{ color: "primary.main", fontWeight: "bolder" }}
            gutterBottom
          >
            {t("analyticsConsent.consentModal.title")}
          </Typography>
          <Typography variant="body1">
            {t("analyticsConsent.consentModal.description")}
          </Typography>
        </div>

        {/* Consent buttons */}
        <Grid2 container size="auto" spacing={1}>
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
