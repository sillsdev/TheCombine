import React from "react";
import { Button, CircularProgress } from "@material-ui/core";
import { buttonSuccess } from "../../types/theme";
import { ButtonProps } from "@material-ui/core/Button";
import { Check } from "@material-ui/icons";
import { Translate } from "react-localize-redux";

interface Props {
  loading: boolean;
  done: boolean;
  doneText?: React.ReactNode | string;
  disabled?: boolean;
}

/**
 * A button that shows a spinning wheel when loading and "done" when done
 */
export default function LoadingDoneButton(props: Props & ButtonProps) {
  return (
    <Button
      type="submit"
      variant="contained"
      {...props}
      disabled={props.disabled ? props.disabled : props.loading}
      style={{
        backgroundColor: props.done ? buttonSuccess : undefined,
        color: props.done ? "white" : undefined,
        ...props.style,
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
