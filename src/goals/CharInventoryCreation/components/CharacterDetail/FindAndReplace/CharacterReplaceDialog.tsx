import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { useState } from "react";
import { Translate } from "react-localize-redux";

import LoadingButton from "components/Buttons/LoadingButton";

interface ReplaceDialogProps {
  open: boolean;
  dialogFindValue: string;
  dialogReplaceValue: string;
  handleAccept: () => Promise<void>;
  handleCancel: () => void;
}

/**
 * Dialog to confirm replacement
 */
export default function CharacterReplaceDialog(props: ReplaceDialogProps) {
  const [loading, setLoading] = useState(false);

  async function submitFindAndReplace() {
    setLoading(true);
    await props.handleAccept();
    setLoading(false);
  }

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
        <LoadingButton
          loading={loading}
          buttonProps={{ onClick: submitFindAndReplace, color: "primary" }}
        >
          <Translate id="buttons.confirm" />
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
