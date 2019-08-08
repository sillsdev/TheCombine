import React from "react";
import { Button, CircularProgress } from "@material-ui/core";
import { buttonSuccess } from "../../types/theme";
import { ButtonProps } from "@material-ui/core/Button";
import { Check } from "@material-ui/icons";
import { Translate } from "react-localize-redux";

interface Props {
  loading: boolean;
  done: boolean;
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
      disabled={props.loading}
      style={{
        marginTop: 30,
        backgroundColor: props.done ? buttonSuccess : undefined,
        color: props.done ? "white" : undefined
      }}
    >
      {props.done ? (
        <React.Fragment>
          <Check />
          <Translate id="createProject.success" />
        </React.Fragment>
      ) : (
        props.children
      )}
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
