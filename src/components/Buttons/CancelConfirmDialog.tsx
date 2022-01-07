import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { ReactElement } from "react";
import { Translate } from "react-localize-redux";

interface CancelConfirmDialogProps {
  open: boolean;
  textId: string;
  handleCancel: () => void;
  handleConfirm: () => void;
  buttonIdCancel?: string;
  buttonIdConfirm?: string;
}

/**
 * Dialog to cancel or confirm an action
 */
export default function CancelConfirmDialog(
  props: CancelConfirmDialogProps
): ReactElement {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <Translate id="buttons.proceedWithCaution" />
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Translate id={props.textId} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.handleCancel}
          variant="outlined"
          color="primary"
          id={props.buttonIdCancel}
        >
          <Translate id="buttons.cancel" />
        </Button>
        <Button
          onClick={props.handleConfirm}
          variant="contained"
          color="primary"
          id={props.buttonIdConfirm}
        >
          <Translate id="buttons.confirm" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
