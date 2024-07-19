import { Turnstile } from "@marsidev/react-turnstile";
import { Fragment, type ReactElement, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { validateCaptcha } from "backend";
import i18n from "i18n";
import { RuntimeConfig } from "types/runtimeConfig";

export interface CaptchaProps {
  /** Parent function to call when CAPTCHA succeeds or fails. */
  setSuccess: (success: boolean) => void;
}

/** Component wrapper for Cloudflare Turnstile (CAPTCHA replacement). */
export default function Captcha(props: CaptchaProps): ReactElement {
  const setSuccess = props.setSuccess;
  const isRequired = useRef(RuntimeConfig.getInstance().captchaRequired());
  const { t } = useTranslation();

  useEffect(() => {
    setSuccess(!isRequired.current);
  }, [isRequired, setSuccess]);

  const siteKey =
    process.env.NODE_ENV === "production"
      ? RuntimeConfig.getInstance().captchaSiteKey()
      : // https://developers.cloudflare.com/turnstile/troubleshooting/testing/
        // has dummy site keys for development and testing; options are
        // invisible pass and fail, visible pass and fail, and forced interaction
        "1x00000000000000000000AA"; // visible pass

  const fail = (): void => {
    setSuccess(false);
    toast.error(t("captcha.error"));
  };
  const succeed = (): void => {
    setSuccess(true);
  };
  const validate = (token: string): void => {
    validateCaptcha(token).then((isValid) => (isValid ? succeed() : fail()));
  };

  return isRequired.current ? (
    <Turnstile
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
