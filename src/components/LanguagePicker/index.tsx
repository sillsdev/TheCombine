import loadable from "@loadable/component";

/** A lazy-loaded Language Picker, because it's a 5MB dependency. */
export const LanguagePicker = loadable(
  () => import("components/LanguagePicker/LanguagePickerWithOptionalT")
);
