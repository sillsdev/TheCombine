import {
  TextField,
  TextFieldProps,
  Typography,
  TypographyProps,
} from "@mui/material";
import { ReactElement, useContext } from "react";

import FontContext, { WithFontProps } from "utilities/fontContext";

/* Various MUI components for use within a FontContext
 * to add the appropriate font to that component. */

// Cannot use `interface` with `extends` because TextFieldProps isn't static.
type TextFieldWithFontProps = TextFieldProps & WithFontProps;

/**
 * `TextField` modified for use within a `FontContext`.
 * The props are extended with 3 optional props:
 *   `analysis: bool?` (used to apply the default analysis font);
 *   `lang: string?` (bcp47 lang-tag for applying the appropriate analysis font);
 *   `vernacular: bool?` (used to apply the vernacular font).
 */
export function TextFieldWithFont(props: TextFieldWithFontProps): ReactElement {
  const fontContext = useContext(FontContext);
  // Use spread to remove the custom props from what is passed into TextField.
  const { analysis, lang, vernacular, ...textFieldProps } = props;
  return (
    <TextField
      {...textFieldProps}
      InputProps={{
        ...textFieldProps.InputProps,
        style: fontContext.addFontToStyle(
          { analysis, lang, vernacular },
          textFieldProps.InputProps?.style
        ),
      }}
    />
  );
}

type TypographyWithFontProps = TypographyProps & WithFontProps;

/**
 * `Typography` modified for use within a `FontContext`.
 * The props are extended with 3 optional props:
 *   `analysis: bool?` (used to apply the default analysis font);
 *   `lang: string?` (bcp47 lang-tag for applying the appropriate analysis font);
 *   `vernacular: bool?` (used to apply the vernacular font).
 */
export function TypographyWithFont(
  props: TypographyWithFontProps
): ReactElement {
  const fontContext = useContext(FontContext);
  // Use spread to remove the custom props from what is passed into Typography.
  const { analysis, lang, vernacular, ...typographyProps } = props;
  return (
    <Typography
      {...typographyProps}
      style={fontContext.addFontToStyle(
        { analysis, lang, vernacular },
        typographyProps.style
      )}
    />
  );
}

type LiWithFontProps = React.DetailedHTMLProps<
  React.LiHTMLAttributes<HTMLLIElement>,
  HTMLLIElement
> &
  WithFontProps;

/**
 * `li` modified for use within a `FontContext`.
 * The props are extended with 3 optional props:
 *   `analysis: bool?` (used to apply the default analysis font);
 *   `lang: string?` (bcp47 lang-tag for applying the appropriate analysis font);
 *   `vernacular: bool?` (used to apply the vernacular font).
 */
export function LiWithFont(props: LiWithFontProps) {
  const fontContext = useContext(FontContext);
  // Use spread to remove the custom props from what is passed into li.
  const { analysis, lang, vernacular, ...liProps } = props;
  return (
    <li
      {...liProps}
      style={fontContext.addFontToStyle(
        { analysis, lang, vernacular },
        liProps.style
      )}
    />
  );
}
