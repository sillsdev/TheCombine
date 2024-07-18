import { Turnstile as MarsiTurnstile } from "@marsidev/react-turnstile";
import { Fragment, type ReactElement, useEffect, useRef } from "react";
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
  const setSuccess = props.setSuccess;
  const isRequired = useRef(RuntimeConfig.getInstance().turnstileRequired());
  const { t } = useTranslation();

  useEffect(() => {
    setSuccess(!isRequired.current);
  }, [isRequired, setSuccess]);

  const siteKey =
    process.env.NODE_ENV === "production"
      ? RuntimeConfig.getInstance().turnstileSiteKey()
      : // https://developers.cloudflare.com/turnstile/troubleshooting/testing/
        "1x00000000000000000000AA"; // visible pass

  const fail = (): void => {
    setSuccess(false);
    toast.error(t("turnstile.error"));
  };
  const succeed = (): void => {
    setSuccess(true);
  };
  const validate = (token: string): void => {
    validateTurnstile(token).then((isValid) => (isValid ? succeed() : fail()));
  };

  return isRequired.current ? (
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
