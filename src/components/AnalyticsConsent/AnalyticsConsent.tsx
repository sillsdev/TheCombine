import { ReactElement } from "react";

interface ConsentProps {
  onChangeConsent: (consentVal: boolean) => void;
}

export function AnalyticsConsent(props: ConsentProps): ReactElement {
  const acceptAnalytics = (): void => {
    props.onChangeConsent(true);
  };
  const rejectAnalytics = (): void => {
    props.onChangeConsent(false);
  };
  return (
    <div>
      <button onClick={acceptAnalytics}>Accept</button>
      <button onClick={rejectAnalytics}>Reject</button>
    </div>
  );
}
