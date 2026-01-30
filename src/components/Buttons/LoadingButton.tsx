import { Button, CircularProgress } from "@mui/material";
import { type ButtonProps } from "@mui/material/Button";
import { type ReactElement, type ReactNode, type Ref } from "react";

import { themeColors } from "types/theme";

interface LoadingProps {
  buttonProps?: ButtonProps & { "data-testid"?: string };
  buttonRef?: Ref<HTMLButtonElement>;
  children?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

/** A button that shows a spinning wheel when `loading = true`.
 * Default button props: `color: "primary", variant: "contained"`. */
export default function LoadingButton(props: LoadingProps): ReactElement {
  return (
    <Button
      color="primary"
      disabled={props.disabled || props.loading}
      ref={props.buttonRef}
      variant="contained"
      {...props.buttonProps}
    >
      {props.children}
      {props.loading && (
        <CircularProgress
          size={24}
          style={{
            color: themeColors.success,
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -12,
            marginLeft: -12,
          }}
        />
      )}
    </Button>
  );
}
