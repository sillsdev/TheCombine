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

import LoadingButton from "components/Buttons/LoadingButton";

interface EditTextDialogProps {
  open: boolean;
  text: string;
  titleId: string;
  close: () => void;
  updateText: (newText: string) => void | Promise<void>;
  buttonIdCancel?: string;
  buttonIdConfirm?: string;
  textFieldId?: string;
}

/**
 * Dialog for editing text and confirm or cancel the edit
 */
export default function EditTextDialog(
  props: EditTextDialogProps
): ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>(props.text);

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
          <Translate id="buttons.cancel" />
        </Button>
        <LoadingButton
          loading={loading}
          buttonProps={{
            onClick: onConfirm,
            color: "primary",
            variant: "contained",
            id: props.buttonIdConfirm,
          }}
        >
          <Translate id="buttons.confirm" />
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
