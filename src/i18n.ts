// https://dev.to/adrai/how-to-properly-internationalize-a-react-application-using-i18next-3hdb#getting-started
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { Bcp47Code, uiWritingSystems } from "types/writingSystem";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    //debug: true, // Uncomment to troubleshoot
    // detection: options,
    // ignoring localStorage and cookies for the detection order lets the user change languages
    // more easily (just switch in the browser and reload, instead of clearing all site data)
    detection: { order: ["queryString", "path", "navigator"] },
    supportedLngs: uiWritingSystems.map((ws) => ws.bcp47),
    // nonExplicitSupportedLngs will (e.g.) use 'es' if the browser is 'es-MX'
    nonExplicitSupportedLngs: true,
    fallbackLng: Bcp47Code.Default,
    interpolation: { escapeValue: false },
  });

export default i18n;
