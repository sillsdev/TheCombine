import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { Translate } from "react-localize-redux";

interface CancelConfirmDialogProps {
  open: boolean;
  textId: string | undefined;
  handleAccept: () => void;
  handleCancel: () => void;
}

/**
 * Dialog to confirm deletion
 */
export default function CancelConfirmDialog(props: CancelConfirmDialogProps) {
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
          <Translate
            id={props.textId ? props.textId : "buttons.deletePermanently"}
          />
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
