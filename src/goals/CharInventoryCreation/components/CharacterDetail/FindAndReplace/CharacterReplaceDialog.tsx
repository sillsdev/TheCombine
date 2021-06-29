import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { Translate } from "react-localize-redux";

interface ReplaceDialogProps {
  open: boolean;
  dialogFindValue: string;
  dialogReplaceValue: string;
  handleAccept: () => void;
  handleCancel: () => void;
}

/**
 * Dialog to confirm replacement
 */
export default function CharacterReplaceDialog(props: ReplaceDialogProps) {
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
          <Translate id={"charInventory.characterSet.replaceAll"} />: "
          <strong>{props.dialogFindValue}</strong>"<br />
          <Translate id={"charInventory.characterSet.replaceWith"} />: "
          <strong>{props.dialogReplaceValue}</strong>" ?
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
