import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// Import for each non-en uiWritingSystem lang in src/types/writingSystem.ts:
import "dayjs/locale/ar";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import "dayjs/locale/pt";
import "dayjs/locale/zh";
import { ReactElement, ReactNode } from "react";

import i18n from "i18n";

export default function DatePickersLocalizationProvider(props: {
  children: ReactNode;
}): ReactElement {
  return (
    <LocalizationProvider
      // If i18n.language changes, user must refresh or log out and back in
      // for the change to take effect in @mui/x-date-pickers components.
      adapterLocale={i18n.language || undefined}
      dateAdapter={AdapterDayjs}
    >
      {props.children}
    </LocalizationProvider>
  );
}
