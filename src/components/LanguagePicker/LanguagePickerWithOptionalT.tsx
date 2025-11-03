import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import { ReactElement } from "react";

type LanguagePickerProps = React.ComponentProps<typeof LanguagePicker>;
type LanguagePickerPropsWithOptionalT = Omit<LanguagePickerProps, "t"> &
  Partial<Pick<LanguagePickerProps, "t">>;

/** This component wraps LanguagePicker to make the 't' prop optional,
 * providing English strings as the default. */
export default function LanguagePickerWithOptionalT(
  props: LanguagePickerPropsWithOptionalT
): ReactElement {
  return <LanguagePicker {...props} t={props.t ?? languagePickerStrings_en} />;
}
