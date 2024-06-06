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
import {
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
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
  const [text, setText] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    setText(props.text);
  }, [props.text]);

  async function onConfirm(): Promise<void> {
    props.close();
    if (text !== props.text) {
      await props.updateText(text);
    }
  }

  function onCancel(): void {
    setText(props.text);
    props.close();
  }

  function escapeClose(
    _: any,
    reason: "backdropClick" | "escapeKeyDown"
  ): void {
    if (reason === "escapeKeyDown") {
      onCancel();
    }
  }

  function confirmIfEnter(event: KeyboardEvent<any>): void {
    if (event.key === Key.Enter) {
      onConfirm();
    }
  }

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton onClick={() => setText("")} size="large">
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
          {t(props.buttonTextIdCancel ?? "buttons.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          variant="outlined"
          color="primary"
          id={props.buttonIdConfirm}
        >
          {t(props.buttonTextIdConfirm ?? "buttons.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
