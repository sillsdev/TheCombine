import { Button, CircularProgress } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import React from "react";

import { buttonSuccess } from "../../types/theme";

interface LoadingProps {
  loading: boolean;
}

/**
 * A button that shows a spinning wheel when loading=true
 */
export default function LoadingButton(props: LoadingProps & ButtonProps) {
  // Use Destructuring to define buttonProps without our LoadingProps.
  const { loading, ...buttonProps } = props;

  return (
    <Button variant="contained" disabled={props.loading} {...buttonProps}>
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
