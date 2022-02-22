import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@material-ui/core";
import { Backspace, Close } from "@material-ui/icons";
import React, { ReactElement, useState } from "react";
import { Translate } from "react-localize-redux";
import { Key } from "ts-key-enum";

import LoadingButton from "components/Buttons/LoadingButton";

interface DeleteEditTextDialogProps {
  open: boolean;
  text: string;
  titleId: string;
  close: () => void;
  updateText: (newText: string) => void | Promise<void>;
  onDelete?: () => void;
  buttonIdDelete?: string;
  buttonIdSave?: string;
  buttonTextIdDelete?: string;
  buttonTextIdSave?: string;
  textFieldId?: string;
}

/**
 * Dialog for editing text, with distinction between cancel and delete.
 */
export default function DeleteEditTextDialog(
  props: DeleteEditTextDialogProps
): ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>(props.text);

  function onCancel() {
    setText(props.text);
    props.close();
  }

  function onDelete() {
    setText(props.text);
    if (props.onDelete) {
      props.onDelete();
    }
    props.close();
  }

  async function onSave() {
    setLoading(true);
    await props.updateText(text);
    setLoading(false);
    props.close();
  }

  function escapeClose(_: any, reason: "backdropClick" | "escapeKeyDown") {
    if (reason === "escapeKeyDown") {
      onCancel();
    }
  }

  function confirmIfEnter(event: React.KeyboardEvent<any>) {
    if (event.key === Key.Enter) {
      onSave();
    }
  }

  const endAdornment = (
    <InputAdornment position="end">
      <Tooltip
        title={<Translate id={"buttons.clearText"} />}
        placement={"left"}
      >
        <IconButton size="small" onClick={() => setText("")}>
          <Backspace />
        </IconButton>
      </Tooltip>
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
        <Tooltip title={<Translate id={"buttons.cancel"} />} placement={"left"}>
          <IconButton
            size="small"
            aria-label="cancel"
            onClick={onCancel}
            style={{ position: "absolute", right: 4, top: 4 }}
          >
            <Close />
          </IconButton>
        </Tooltip>
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
          onClick={onDelete}
          variant="outlined"
          color="primary"
          id={props.buttonIdDelete}
        >
          <Translate id={props.buttonTextIdDelete ?? "buttons.delete"} />
        </Button>
        <LoadingButton
          loading={loading}
          buttonProps={{
            onClick: onSave,
            color: "primary",
            variant: "contained",
            id: props.buttonIdSave,
          }}
        >
          <Translate id={props.buttonTextIdSave ?? "buttons.save"} />
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
