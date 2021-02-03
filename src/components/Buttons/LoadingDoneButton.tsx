import { Button, CircularProgress } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import { Check } from "@material-ui/icons";
import { Translate } from "react-localize-redux";
import React from "react";

import { buttonSuccess } from "types/theme";

interface LoadingDoneProps {
  loading: boolean;
  done: boolean;
  doneText?: React.ReactNode | string;
  disabled?: boolean;
  children?: React.ReactNode;
  buttonProps?: ButtonProps;
}

/**
 * A button that shows a spinning wheel when loading and "done" when done
 */
export default function LoadingDoneButton(props: LoadingDoneProps) {
  return (
    <Button
      type="submit"
      variant="contained"
      {...props.buttonProps}
      disabled={props.disabled ? props.disabled : props.loading}
      style={{
        backgroundColor: props.done ? buttonSuccess : undefined,
        color: props.done ? "white" : undefined,
        ...props.buttonProps?.style,
      }}
    >
      {props.done ? (
        <React.Fragment>
          <Check />
          {props.doneText ? props.doneText : <Translate id="buttons.done" />}
        </React.Fragment>
      ) : (
        props.children
      )}
      {props.loading && !props.done && (
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
