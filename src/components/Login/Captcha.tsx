import { Turnstile } from "@marsidev/react-turnstile";
import { Fragment, type ReactElement, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { verifyCaptchaToken } from "backend";
import i18n from "i18n";
import { RuntimeConfig } from "types/runtimeConfig";
import theme from "types/theme";

export interface CaptchaProps {
  /** Parent function to call when CAPTCHA succeeds or fails. */
  setSuccess: (success: boolean) => void;
}

/** Component wrapper for CAPTCHA implementation. */
export default function Captcha(props: CaptchaProps): ReactElement {
  const setSuccess = props.setSuccess;
  const isRequired = useRef(RuntimeConfig.getInstance().captchaRequired());
  const { t } = useTranslation();

  useEffect(() => {
    setSuccess(!isRequired.current);
  }, [isRequired, setSuccess]);

  const fail = (): void => {
    setSuccess(false);
    toast.error(t("captcha.error"));
  };
  const succeed = (): void => {
    setSuccess(true);
  };
  const verify = (token: string): void => {
    verifyCaptchaToken(token).then((isVerified) =>
      isVerified ? succeed() : fail()
    );
  };

  return isRequired.current ? (
    <Turnstile
      onError={fail}
      onExpire={fail}
      onSuccess={verify}
      options={{ language: i18n.resolvedLanguage, theme: "light" }}
      siteKey={RuntimeConfig.getInstance().captchaSiteKey()}
      style={{ marginBottom: theme.spacing(1) }}
    />
  ) : (
    <Fragment />
  );
}
