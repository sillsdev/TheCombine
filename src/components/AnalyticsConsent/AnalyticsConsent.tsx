import { Button } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { ReactElement, useState } from "react";

interface ConsentProps {
  onChangeConsent: (consentVal: boolean) => void;
}

export function AnalyticsConsent(props: ConsentProps): ReactElement {

  const [responded, setResponded] = useState(false);
  const acceptAnalytics = (): void => {

    setResponded(true);
    props.onChangeConsent(true);
  };
  const rejectAnalytics = (): void => {

    setResponded(false);
    props.onChangeConsent(false);
  };


  return (
    <div>
      <Drawer anchor={"bottom"} open={!responded}>
        MyDrawer!
        <button onClick={acceptAnalytics}>Accept</button>
        <button onClick={rejectAnalytics}>Reject</button>
      </Drawer>
      
    </div>
  );
}
