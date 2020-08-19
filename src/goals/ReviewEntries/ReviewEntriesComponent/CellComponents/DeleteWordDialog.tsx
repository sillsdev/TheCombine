import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import React from "react";
import { Translate } from "react-localize-redux";

interface DeleteWordDialogProps {
  open: boolean;
  handleAccept: () => void;
  handleCancel: () => void;
}

/**
 * Dialog to confirm word deletion
 */
export default function DeleteWordDialog(
  props: ButtonProps & DeleteWordDialogProps
) {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <Translate id="siteSettings.proceedWithCaution" />
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Translate id="reviewEntries.deleteWord" />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleCancel} variant="outlined" color="primary">
          <Translate id="buttons.cancel" />
        </Button>
        <Button
          onClick={props.handleAccept}
          variant="contained"
          color="primary"
        >
          <Translate id="buttons.confirm" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
