import {
  LanguagePicker as MLP,
  languagePickerStrings_en,
} from "mui-language-picker";
import { ReactElement } from "react";

type LanguagePickerProps = Omit<React.ComponentProps<typeof MLP>, "t">;

/** A wrapped `mui-language-picker` component with the localization strings preset. */
export default function LanguagePicker(
  props: LanguagePickerProps
): ReactElement {
  return <MLP {...props} t={languagePickerStrings_en} />;
}
