import { Button, CircularProgress } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import React from "react";

import { buttonSuccess } from "../../types/theme";

interface LoadingProps {
  loading: boolean;
  children?: React.ReactNode;
  buttonProps?: ButtonProps;
}

/**
 * A button that shows a spinning wheel when loading=true
 */
export default function LoadingButton(props: LoadingProps) {
  return (
    <Button variant="contained" disabled={props.loading} {...props.buttonProps}>
      {props.children}
      {props.loading && (
        <CircularProgress
          size={24}
          style={{
            color: buttonSuccess,
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
