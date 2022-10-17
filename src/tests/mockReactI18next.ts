/* Use `import "tests/mockReactI18next.ts";` in a test file to mock i18next.
 * (For testing components with `Trans`, see tests/i18nMock.ts instead.)
 * This import should be placed before the other internal imports.
 * It must come before any file that imports `react-i18next`. */

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (str: string) => str }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = {
      ...Component.defaultProps,
      t: (s: string) => s,
      i18n: { resolvedLanguage: "" },
    };
    return Component;
  },
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
}));

export {};
