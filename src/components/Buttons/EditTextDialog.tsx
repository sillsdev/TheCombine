import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@material-ui/core";
import { Clear } from "@material-ui/icons";
import React, { ReactElement, useState } from "react";
import { Translate } from "react-localize-redux";
import { Key } from "ts-key-enum";

interface EditTextDialogProps {
  open: boolean;
  text: string;
  titleId: string;
  close: () => void;
  updateText: (newText: string) => void | Promise<void>;
  buttonIdCancel?: string;
  buttonIdConfirm?: string;
  buttonTextIdCancel?: string;
  buttonTextIdConfirm?: string;
  textFieldId?: string;
}

/**
 * Dialog for editing text and confirm or cancel the edit
 */
export default function EditTextDialog(
  props: EditTextDialogProps
): ReactElement {
  const [text, setText] = useState<string>(props.text);

  async function onConfirm() {
    props.close();
    if (text !== props.text) {
      await props.updateText(text);
    }
  }

  function onCancel() {
    setText(props.text);
    props.close();
  }

  function escapeClose(_: any, reason: "backdropClick" | "escapeKeyDown") {
    if (reason === "escapeKeyDown") {
      props.close();
    }
  }

  function confirmIfEnter(event: React.KeyboardEvent<any>) {
    if (event.key === Key.Enter) {
      onConfirm();
    }
  }

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton onClick={() => setText("")}>
        <Clear />
      </IconButton>
    </InputAdornment>
  );

  return (
    <Dialog
      open={props.open}
      onClose={escapeClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <Translate id={props.titleId} />
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyPress={confirmIfEnter}
          InputProps={{ endAdornment }}
          id={props.textFieldId}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="primary"
          id={props.buttonIdCancel}
        >
          <Translate id={props.buttonTextIdCancel ?? "buttons.cancel"} />
        </Button>
        <Button
          onClick={onConfirm}
          variant="outlined"
          color="primary"
          id={props.buttonIdConfirm}
        >
          <Translate id={props.buttonTextIdConfirm ?? "buttons.confirm"} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
