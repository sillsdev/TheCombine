import ReCaptcha from "@matt-block/react-recaptcha-v2";
import { Fragment, ReactElement } from "react";

import { RuntimeConfig } from "types/runtimeConfig";

interface CaptchaProps {
  onExpire: () => void;
  onSuccess: () => void;
}

export default function Captcha(props: CaptchaProps): ReactElement {
  return RuntimeConfig.getInstance().captchaRequired() ? (
    <div className="form-group" style={{ margin: "5px" }}>
      <ReCaptcha
        onError={() =>
          console.error("Something went wrong; check your connection.")
        }
        onExpire={props.onExpire}
        onSuccess={props.onSuccess}
        siteKey={RuntimeConfig.getInstance().captchaSiteKey()}
        size="normal"
        theme="light"
      />
    </div>
  ) : (
    <Fragment />
  );
}
