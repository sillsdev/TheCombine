import {
  TextField,
  TextFieldProps,
  Typography,
  TypographyProps,
} from "@mui/material";
import { ReactElement, useContext } from "react";

import FontContext from "utilities/fontContext";

/** Various MUI components for use within a FontContext
 * to add the appropriate font to that component.
 *
 * Each component's input props are extended with 3 optional props:
 *   analysis: bool? (used to apply the default analysis font)
 *   lang: string? (bcp47 lang-tag for applying the appropriate analysis font)
 *   vernacular: bool? (used to apply the vernacular font)
 *
 * Precedence, from highest to lowest, moving to the next one if falsy:
 *   vernacular
 *   lang
 *   analysis
 *   fontFamily specified in MUI props
 *   "inherit"
 */

// Cannot use `extends` because TextFieldProps isn't static.
type TextFieldWithFontProps = TextFieldProps & {
  analysis?: boolean;
  lang?: string;
  vernacular?: boolean;
};

export function TextFieldWithFont(props: TextFieldWithFontProps): ReactElement {
  const fontContext = useContext(FontContext);
  // Use spread to remove the custom props from what is passed into TextField.
  const { analysis, lang, vernacular, ...textFieldProps } = props;
  return (
    <TextField
      {...textFieldProps}
      InputProps={{
        ...textFieldProps.InputProps,
        style: {
          ...textFieldProps.InputProps?.style,
          fontFamily: vernacular
            ? fontContext.vernacularFont
            : lang
            ? fontContext.getLangFont(lang)
            : analysis
            ? fontContext.analysisFont
            : textFieldProps.InputProps?.style?.fontFamily ?? "inherit",
        },
      }}
    />
  );
}

interface TypographyWithFontProps extends TypographyProps {
  analysis?: boolean;
  lang?: string;
  vernacular?: boolean;
}

export function TypographyWithFont(
  props: TypographyWithFontProps
): ReactElement {
  const fontContext = useContext(FontContext);
  // Use spread to remove the custom props from what is passed into Typography.
  const { analysis, lang, vernacular, ...typographyProps } = props;
  return (
    <Typography
      {...typographyProps}
      style={{
        ...typographyProps.style,
        fontFamily: vernacular
          ? fontContext.vernacularFont
          : lang
          ? fontContext.getLangFont(lang)
          : analysis
          ? fontContext.analysisFont
          : typographyProps.style?.fontFamily ?? "inherit",
      }}
    />
  );
}
