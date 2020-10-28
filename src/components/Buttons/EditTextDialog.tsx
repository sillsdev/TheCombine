import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import LoadingButton from "./LoadingButton";

interface EditTextDialogProps {
  open: boolean;
  text: string;
  titleId: string;
  onClose: () => void;
  onConfirm: (newText: string) => void | Promise<void>;
}

/**
 * Dialog for editing text and confirm or cancel the edit
 */
export default function EditTextDialog(props: EditTextDialogProps) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [text, setText] = React.useState<string>(props.text);

  async function onConfirm() {
    if (text !== props.text) {
      setLoading(true);
      await props.onConfirm(text);
      setLoading(false);
    }
    props.onClose();
  }

  function onCancel() {
    setText(props.text);
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
        <TextField
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} variant="outlined" color="primary">
          <Translate id="buttons.cancel" />
        </Button>
        <LoadingButton
          onClick={onConfirm}
          color="primary"
          variant="contained"
          loading={loading}
          {...props}
        >
          <Translate id="buttons.confirm" />
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
