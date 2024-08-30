import { Clear } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { type KeyboardEvent, type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

interface EditTextDialogProps {
  open: boolean;
  titleId: string;
  close: () => void;
  submitText: (newText: string) => void | Promise<void>;
  buttonIdCancel?: string;
  buttonIdClear?: string;
  buttonIdConfirm?: string;
  buttonTextIdCancel?: string;
  buttonTextIdConfirm?: string;
  textFieldId?: string;
}

/** Dialog for submitting new text */
export default function SubmitTextDialog(
  props: EditTextDialogProps
): ReactElement {
  const [text, setText] = useState("");
  const { t } = useTranslation();

  async function onConfirm(): Promise<void> {
    props.close();
    if (text) {
      await props.submitText(text);
      setText("");
    }
  }

  function onCancel(): void {
    setText("");
    props.close();
  }

  function escapeClose(
    _: any,
    reason: "backdropClick" | "escapeKeyDown"
  ): void {
    if (reason === "escapeKeyDown") {
      props.close();
    }
  }

  function confirmIfEnter(event: KeyboardEvent<any>): void {
    if (event.key === Key.Enter) {
      onConfirm();
    }
  }

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton
        data-testid={props.buttonIdClear}
        id={props.buttonIdClear}
        onClick={() => setText("")}
        size="large"
      >
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
      <DialogTitle id="alert-dialog-title">{t(props.titleId)}</DialogTitle>
      <DialogContent>
        <TextField
          variant="standard"
          autoFocus
          data-testid={props.textFieldId}
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
          data-testid={props.buttonIdCancel}
          id={props.buttonIdCancel}
        >
          {t(props.buttonTextIdCancel ?? "buttons.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          variant="outlined"
          color="primary"
          data-testid={props.buttonIdConfirm}
          id={props.buttonIdConfirm}
        >
          {t(props.buttonTextIdConfirm ?? "buttons.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
