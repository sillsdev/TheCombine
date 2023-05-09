// https://dev.to/adrai/how-to-properly-internationalize-a-react-application-using-i18next-3hdb#getting-started
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { i18nextFallbacks, i18nextLangs } from "types/writingSystem";

// declare custom type options so the return is always a string.
declare module "i18next" {
  interface CustomTypeOptions {
    returnNull: false;
  }
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      debug: true, // Uncomment to troubleshoot
      returnNull: false,
      // detection: options,
      // ignoring localStorage and cookies for the detection order lets the user change languages
      // more easily (just switch in the browser and reload, instead of clearing all site data)
      detection: { order: ["queryString", "path", "navigator"] },
      supportedLngs: i18nextLangs,
      // nonExplicitSupportedLngs will (e.g.) use 'es' if the browser is 'es-MX'
      nonExplicitSupportedLngs: true,
      fallbackLng: i18nextFallbacks,
      interpolation: { escapeValue: false },
    },
    setDir // Callback function to set the direction ("ltr" vs "rtl") after i18n has initialized
  );

function setDir() {
  document.body.dir = i18n.dir();
}

export default i18n;
