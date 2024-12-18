import Drawer from "@mui/material/Drawer";
import { ReactElement } from "react";

interface ConsentProps {
  onChangeConsent: (consentVal: boolean | undefined) => void;
  required: boolean;
}

export function AnalyticsConsent(props: ConsentProps): ReactElement {
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
        <button onClick={acceptAnalytics}>Accept</button>
        <button onClick={rejectAnalytics}>Reject</button>
      </Drawer>
    </div>
  );
}
