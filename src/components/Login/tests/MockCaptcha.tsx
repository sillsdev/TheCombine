import { type ReactElement, useEffect } from "react";

import { type CaptchaProps } from "components/Login/Captcha";

/** Mock CAPTCHA component that automatically succeeds. */
export default function MockCaptcha(props: CaptchaProps): ReactElement {
  useEffect(() => {
    props.setSuccess(true);
  }, [props]);
  return <div id="mock-captcha" />;
}
