import { Backspace, Close } from "@mui/icons-material";
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
} from "@mui/material";
import { type KeyboardEvent, type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import { LoadingButton } from "components/Buttons";

interface DeleteEditTextDialogProps {
  open: boolean;
  text: string;
  titleId: string;
  close: () => void;
  updateText: (newText: string) => void | Promise<void>;
  onDelete?: () => void;
  buttonIdCancel?: string;
  buttonIdClear?: string;
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
  const { t } = useTranslation();

  const inlineStart = document.body.dir === "rtl" ? "right" : "left";

  function onCancel(): void {
    setText(props.text);
    props.close();
  }

  function onDelete(): void {
    setText(props.text);
    if (props.onDelete) {
      props.onDelete();
    }
    props.close();
  }

  async function onSave(): Promise<void> {
    setLoading(true);
    await props.updateText(text);
    setLoading(false);
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
      onSave();
    }
  }

  const endAdornment = (
    <InputAdornment position="end">
      <Tooltip placement={inlineStart} title={t("buttons.clearText")}>
        <IconButton
          data-testid={props.buttonIdClear}
          id={props.buttonIdClear}
          onClick={() => setText("")}
          size="small"
        >
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
        {t(props.titleId)}
        <Tooltip placement={inlineStart} title={t("buttons.cancel")}>
          <IconButton
            size="small"
            aria-label="close"
            data-testid={props.buttonIdCancel}
            id={props.buttonIdCancel}
            onClick={onCancel}
            style={{ insetInlineEnd: 4, position: "absolute", top: 4 }}
          >
            <Close />
          </IconButton>
        </Tooltip>
      </DialogTitle>
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
          onClick={onDelete}
          variant="outlined"
          color="primary"
          data-testid={props.buttonIdDelete}
          id={props.buttonIdDelete}
        >
          {t(props.buttonTextIdDelete ?? "buttons.delete")}
        </Button>
        <LoadingButton
          buttonProps={{
            "data-testid": props.buttonIdSave,
            id: props.buttonIdSave,
            onClick: onSave,
          }}
          loading={loading}
        >
          {t(props.buttonTextIdSave ?? "buttons.save")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
