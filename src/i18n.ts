import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { Bcp47Code } from "types/writingSystem";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: Bcp47Code.Default,
    interpolation: { escapeValue: false },
    resources: { en: { translation: {} } },
  });

export default i18n;
