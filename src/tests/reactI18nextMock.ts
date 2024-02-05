/* Use `import "tests/reactI18nextMock.ts";` in a test file to mock i18next.
 * (For testing components with `Trans`, see tests/i18nMock.ts instead.)
 * This import should be placed before the other internal imports.
 * It must come before any file that imports `react-i18next`. */

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
