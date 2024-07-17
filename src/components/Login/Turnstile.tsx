import { Turnstile as MarsiTurnstile } from "@marsidev/react-turnstile";
import { Fragment, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { validateTurnstile } from "backend";
import i18n from "i18n";
import { RuntimeConfig } from "types/runtimeConfig";

export interface TurnstileProps {
  /** Parent function to call when Turnstile succeeds or fails. */
  setSuccess: (success: boolean) => void;
}

/** Component wrapper for Cloudflare Turnstile (CAPTCHA replacement). */
export default function Turnstile(props: TurnstileProps): ReactElement {
  const { t } = useTranslation();

  const siteKey =
    process.env.NODE_ENV === "production"
      ? "0x4AAAAAAAe9zmM2ysXGSJk1" // the true site key for deployment
      : // https://developers.cloudflare.com/turnstile/troubleshooting/testing/
        //"1x00000000000000000000AA"; // visible pass
        //"2x00000000000000000000AB"; // visible fail
        //"1x00000000000000000000BB"; // invisible pass
        //"2x00000000000000000000BB"; // invisible fail
        "3x00000000000000000000FF"; // force interactive challenge

  const fail = (): void => {
    props.setSuccess(false);
    toast.error(t("turnstile.error"));
  };
  const succeed = (): void => {
    props.setSuccess(true);
  };
  const validate = (token: string): void => {
    validateTurnstile(token).then((isValid) => (isValid ? succeed() : fail()));
  };

  return RuntimeConfig.getInstance().turnstileRequired() ? (
    <MarsiTurnstile
      onError={fail}
      onExpire={fail}
      onSuccess={validate}
      options={{ language: i18n.resolvedLanguage, theme: "light" }}
      siteKey={siteKey}
    />
  ) : (
    <Fragment />
  );
}
