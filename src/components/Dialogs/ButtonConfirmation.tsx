import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { type KeyboardEvent, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import LoadingButton from "components/Buttons/LoadingButton";

interface ButtonConfirmationProps {
  open: boolean;
  textId: string;
  titleId: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  buttonIdClose?: string;
  buttonIdConfirm?: string;
  buttonLabelClose?: string;
  buttonLabelConfirm?: string;
  disableEscapeKeyDown?: boolean;
  enableEnterKeyDown?: boolean;
}

/**
 * Dialog for a button to confirm or cancel its click action
 */
export default function ButtonConfirmation(
  props: ButtonConfirmationProps
): ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  async function onConfirm(): Promise<void> {
    setLoading(true);
    await props.onConfirm();
    setLoading(false);
    props.onClose();
  }

  const dialogOnClose = (
    _: unknown,
    reason: "backdropClick" | "escapeKeyDown"
  ): void => {
    if (reason === "escapeKeyDown" && props.disableEscapeKeyDown) {
      return;
    }
    props.onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === Key.Enter && !loading && props.enableEnterKeyDown) {
      onConfirm();
    }
  };

  return (
    <Dialog
      open={props.open}
      onClose={dialogOnClose}
      onKeyDown={handleKeyDown}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{t(props.titleId)}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {t(props.textId)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          aria-label={props.buttonLabelClose}
          color="primary"
          data-testid={props.buttonIdClose}
          id={props.buttonIdClose}
          onClick={props.onClose}
          variant="outlined"
        >
          {t("buttons.cancel")}
        </Button>
        <LoadingButton
          buttonProps={{
            "aria-label": props.buttonLabelConfirm,
            "data-testid": props.buttonIdConfirm,
            id: props.buttonIdConfirm,
            onClick: onConfirm,
          }}
          loading={loading}
        >
          {t("buttons.confirm")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
