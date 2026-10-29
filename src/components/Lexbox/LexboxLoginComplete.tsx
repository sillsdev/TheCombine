import { Typography } from "@mui/material";
import { type ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { notifyLexboxLogin } from "components/Lexbox/lexboxAuthChannel";

/** Landing page for the Lexbox login window: reports the login, then closes itself. */
export default function LexboxLoginComplete(): ReactElement {
  const { t } = useTranslation();

  useEffect(() => {
    notifyLexboxLogin();
    // Only succeeds for a window opened by script; otherwise the message below remains.
    window.close();
  }, []);

  return <Typography sx={{ m: 2 }}>{t("lexbox.loginComplete")}</Typography>;
}
