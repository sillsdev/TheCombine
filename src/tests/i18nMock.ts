/* Adapted from https://react.i18next.com/misc/testing
 * (In most cases, this isn't needed.
 * Instead you can use tests/reactI18nextMock.ts to mock out i18n completely.)
 * For a simple i18next wrapper, add the following to a test file:
 * * import { I18nextProvider } from "react-i18next";
 * * import i18n from "tests/i18nMock";
 * Then wrap the component being rendered with <I18nextProvider i18n={i18n}> */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { Bcp47Code } from "types/writingSystem";

i18n.use(initReactI18next).init({
  //debug: true, // Uncomment to troubleshoot tests
  fallbackLng: Bcp47Code.Default,
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: { "createProject.uploadFormat": "mockA<1>mockB</1>mockC" },
    },
  },
});

export default i18n;
