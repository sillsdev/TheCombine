import { type ReactElement, useEffect } from "react";

import { type TurnstileProps } from "components/Login/Turnstile";

/** Mock Turnstile component that automatically succeeds. */
export default function MockTurnstile(props: TurnstileProps): ReactElement {
  useEffect(() => {
    props.setSuccess(true);
  }, [props]);
  return <div id="mock-turnstile" />;
}
