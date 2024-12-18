import { List, ListItemButton, Typography } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

interface ConsentProps {
  onChangeConsent: (consentVal: boolean | undefined) => void;
  required: boolean;
}

export function AnalyticsConsent(props: ConsentProps): ReactElement {
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

  return (
    <div>
      <Drawer
        anchor={"bottom"}
        open
        onClose={!props.required ? clickedAway : undefined}
      >
        <List>
          <ListItemButton
            onClick={acceptAnalytics}
            style={{ justifyContent: "center" }}
          >
            <Typography>
              {t("analyticsConsent.consentModal.acceptAllBtn")}
            </Typography>
          </ListItemButton>
          <ListItemButton
            onClick={rejectAnalytics}
            style={{ justifyContent: "center" }}
          >
            <Typography>
              {t("analyticsConsent.consentModal.acceptNecessaryBtn")}
            </Typography>
          </ListItemButton>
        </List>
      </Drawer>
    </div>
  );
}
