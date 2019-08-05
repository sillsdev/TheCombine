import React from "react";
import { Button, CircularProgress } from "@material-ui/core";
import { buttonSuccess } from "../../types/theme";
import { ButtonProps } from "@material-ui/core/Button";

interface Props {
  loading: boolean;
}

/**
 * A button that shows a spinning wheel when loading=true
 */
export default function LoadingButton(props: Props & ButtonProps) {
  return (
    <Button variant="contained" disabled={props.loading} {...props}>
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
            marginLeft: -12
          }}
        />
      )}
    </Button>
  );
}
