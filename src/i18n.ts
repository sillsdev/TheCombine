// https://dev.to/adrai/how-to-properly-internationalize-a-react-application-using-i18next-3hdb#getting-started
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { Bcp47Code } from "types/writingSystem";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: Bcp47Code.Default,
    interpolation: { escapeValue: false },
  });

export default i18n;
