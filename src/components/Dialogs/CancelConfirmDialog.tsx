import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { type ReactElement, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import LoadingButton from "components/Buttons/LoadingButton";

export interface CancelConfirmDialogProps {
  open: boolean;
  text: string | ReactElement;
  title?: string;
  handleCancel: () => void;
  handleConfirm: () => Promise<void> | void;
  buttonIdCancel?: string;
  buttonIdConfirm?: string;
  buttonLabelCancel?: string;
  buttonLabelConfirm?: string;
  disableBackdropClick?: boolean;
  focusOnConfirmButton?: boolean;
}

/**
 * Dialog to cancel or confirm an action
 */
export default function CancelConfirmDialog(
  props: CancelConfirmDialogProps
): ReactElement {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const onConfirm = async (): Promise<void> => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      await props.handleConfirm();
    } finally {
      setLoading(false);
    }
  };

  const dialogOnClose = (
    _: unknown,
    reason: "backdropClick" | "escapeKeyDown"
  ): void => {
    if (reason === "backdropClick" && props.disableBackdropClick) {
      return;
    }
    props.handleCancel();
  };

  const onEntered = (): void => {
    if (props.focusOnConfirmButton) {
      confirmButtonRef.current?.focus();
    }
  };

  return (
    <Dialog
      open={props.open}
      onClose={dialogOnClose}
      slotProps={{ transition: { onEntered } }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {t(props.title || "buttons.proceedWithCaution")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {typeof props.text === "string" ? t(props.text) : props.text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          aria-label={props.buttonLabelCancel}
          color="primary"
          data-testid={props.buttonIdCancel}
          disabled={loading}
          id={props.buttonIdCancel}
          onClick={props.handleCancel}
          variant="outlined"
        >
          {t("buttons.cancel")}
        </Button>
        <LoadingButton
          buttonRef={confirmButtonRef}
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
