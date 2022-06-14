// https://react.i18next.com/misc/testing
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { Bcp47Code } from "types/writingSystem";

i18n.use(initReactI18next).init({
  //debug: true, // uncomment for troubleshooting tests
  fallbackLng: Bcp47Code.Default,
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: { "createProject.uploadFormat": "mockA<1>mockB</1>mockC" },
    },
  },
});

export default i18n;
