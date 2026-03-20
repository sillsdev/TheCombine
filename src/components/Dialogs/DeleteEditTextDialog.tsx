import { Backspace, Close } from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { type KeyboardEvent, type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import LoadingButton from "components/Buttons/LoadingButton";
import { NormalizedTextField } from "utilities/fontComponents";

interface DeleteEditTextDialogProps {
  open: boolean;
  text: string;
  titleId: string;
  close: () => void;
  updateText: (newText: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [text, setText] = useState<string>(props.text);
  const { t } = useTranslation();

  const inlineStart = document.body.dir === "rtl" ? "right" : "left";

  function onCancel(): void {
    setText(props.text);
    props.close();
  }

  async function onDelete(): Promise<void> {
    setIsDeleting(true);
    try {
      setText(props.text);
      await props.onDelete?.();
      props.close();
    } finally {
      setIsDeleting(false);
    }
  }

  async function onSave(): Promise<void> {
    setIsSaving(true);
    try {
      await props.updateText(text);
      props.close();
    } finally {
      setIsSaving(false);
    }
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
        <NormalizedTextField
          variant="standard"
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyPress={confirmIfEnter}
          slotProps={{ input: { endAdornment } }}
          id={props.textFieldId}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          buttonProps={{
            "data-testid": props.buttonIdDelete,
            id: props.buttonIdDelete,
            onClick: onDelete,
            variant: "outlined",
          }}
          disabled={isSaving}
          loading={isDeleting}
        >
          {t(props.buttonTextIdDelete ?? "buttons.delete")}
        </LoadingButton>
        <LoadingButton
          buttonProps={{
            "data-testid": props.buttonIdSave,
            id: props.buttonIdSave,
            onClick: onSave,
          }}
          disabled={isDeleting}
          loading={isSaving}
        >
          {t(props.buttonTextIdSave ?? "buttons.save")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
