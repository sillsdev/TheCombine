/* Use `import "i18n/tests/reactI18nextMock.ts";` in `setupTests.js` to mock i18next globally.
 * (For testing components with `Trans`, see i18n/tests/i18nMock.ts instead.)
 * This import should occur before other internal imports that use `react-i18next`. */

const t = (key: string | string[]): string =>
  Array.isArray(key) ? key[0] : key;
const i18n = { resolvedLanguage: "" };

jest.mock("react-i18next", () => ({
  initReactI18next: { init: jest.fn(), type: "3rdParty" },
  Trans: () => "div",
  useTranslation: () => ({ i18n, t }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...Component.defaultProps, i18n, t };
    return Component;
  },
}));

export {};
