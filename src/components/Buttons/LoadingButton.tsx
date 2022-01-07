import { Button, CircularProgress } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import React, { ReactElement } from "react";

import { themeColors } from "types/theme";

interface LoadingProps {
  buttonProps?: ButtonProps;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * A button that shows a spinning wheel when loading=true
 */
export default function LoadingButton(props: LoadingProps): ReactElement {
  return (
    <Button
      variant="contained"
      disabled={props.disabled || props.loading}
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
