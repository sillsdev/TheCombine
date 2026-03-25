import loadable from "@loadable/component";

/** A lazy-loaded Language Picker, because it's a 5 MB dependency. */
const LoadableLanguagePicker = loadable(
  () => import("components/LanguagePicker/LanguagePicker")
);

export default LoadableLanguagePicker;
