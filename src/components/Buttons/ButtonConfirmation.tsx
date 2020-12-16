import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";

import LoadingButton from "./LoadingButton";

interface ButtonConfirmationProps {
  open: boolean;
  textId: string;
  titleId: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

/**
 * Dialog for a button to confirm or cancel its click action
 */
export default function ButtonConfirmation(props: ButtonConfirmationProps) {
  const [loading, setLoading] = useState<boolean>(false);

  async function onConfirm() {
    setLoading(true);
    await props.onConfirm();
    setLoading(false);
    props.onClose();
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <Translate id={props.titleId} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Translate id={props.textId} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} variant="outlined" color="primary">
          <Translate id="buttons.cancel" />
        </Button>
        <LoadingButton
          loading={loading}
          buttonProps={{
            onClick: onConfirm,
            color: "primary",
            variant: "contained",
          }}
        >
          <Translate id="buttons.confirm" />
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
