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
}));

export {};
