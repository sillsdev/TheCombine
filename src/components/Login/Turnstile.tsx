import { Turnstile as MarsiTurnstile } from "@marsidev/react-turnstile";
import { Fragment, type ReactElement } from "react";

import { validateTurnstile } from "backend";
import { RuntimeConfig } from "types/runtimeConfig";

interface TurnstileProps {
  setSuccess: (success: boolean) => void;
}

export default function Turnstile(props: TurnstileProps): ReactElement {
  const siteKey =
    process.env.NODE_ENV === "development"
      ? //"1x00000000000000000000AA" // visible pass
        //"2x00000000000000000000AB" // visible fail
        //"1x00000000000000000000BB" // invisible pass
        //"2x00000000000000000000BB" // invisible fail
        "3x00000000000000000000FF" // force interactive challenge
      : "0x4AAAAAAAe9zmM2ysXGSJk1"; // the true site key for deployment
  return RuntimeConfig.getInstance().captchaRequired() ? (
    <MarsiTurnstile
      onError={() => props.setSuccess(false)}
      onExpire={() => props.setSuccess(false)}
      onSuccess={(token: string) => {
        validateTurnstile(token).then(props.setSuccess);
      }}
      options={{ theme: "light" }}
      siteKey={siteKey}
    />
  ) : (
    <Fragment />
  );
}
