/* Use `import "tests/reactI18nextMock.ts";` in `setupTests.js` to mock i18next globally.
 * (For testing components with `Trans`, see tests/i18nMock.ts instead.)
 * This import should occur before other internal imports that use `react-i18next`. */

jest.mock("react-i18next", () => ({
  initReactI18next: {
    init: jest.fn(),
    type: "3rdParty",
  },
  Trans: () => "div",
  useTranslation: () => ({
    i18n: { resolvedLanguage: "" },
    t: (str: string) => str,
  }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = {
      ...Component.defaultProps,
      i18n: { resolvedLanguage: "" },
      t: (s: string) => s,
    };
    return Component;
  },
}));

export {};
