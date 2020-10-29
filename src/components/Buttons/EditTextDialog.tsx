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
  close: () => void;
  updateText: (newText: string) => void | Promise<void>;
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
      await props.updateText(text);
      setLoading(false);
    }
    props.close();
  }

  function onCancel() {
    setText(props.text);
    props.close();
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.close}
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
