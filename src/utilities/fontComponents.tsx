import {
  TextField,
  type TextFieldProps,
  Typography,
  type TypographyProps,
} from "@mui/material";
import {
  type DetailedHTMLProps,
  type LiHTMLAttributes,
  type ReactElement,
  useContext,
} from "react";

import FontContext, { type WithFontProps } from "utilities/fontContext";

/* Various MUI components for use within a FontContext
 * to add the appropriate font to that component. */

// Cannot use `interface` with `extends` because TextFieldProps isn't static.
type NormalizedTextFieldProps = TextFieldProps & {
  form?: "NFC" | "NFD" | "NFKC" | "NFKD";
};

/** `TextField` that automatically normalizes the `onChange` text (default: with "NFC"). */
export function NormalizedTextField(
  props: NormalizedTextFieldProps
): ReactElement {
  const { form, ...textFieldProps } = props;
  return (
    <TextField
      {...textFieldProps}
      onChange={(e) => {
        if (textFieldProps.onChange) {
          textFieldProps.onChange({
            ...e,
            target: {
              ...e.target,
              value: e.target.value.normalize(form || "NFC"),
            },
          });
        }
      }}
    />
  );
}

// Cannot use `interface` with `extends` because NormalizedTextFieldProps isn't static.
type TextFieldWithFontProps = NormalizedTextFieldProps & WithFontProps;

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
  const input = textFieldProps.slotProps?.input;
  const inputProps = typeof input === "function" ? input({}) : input;
  return (
    <NormalizedTextField
      {...textFieldProps}
      slotProps={{
        ...textFieldProps.slotProps,
        input: {
          ...inputProps,
          style: fontContext.addFontToStyle(
            { analysis, lang, vernacular },
            inputProps?.style
          ),
        },
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

type LiWithFontProps = DetailedHTMLProps<
  LiHTMLAttributes<HTMLLIElement>,
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
export function LiWithFont(props: LiWithFontProps): ReactElement {
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
