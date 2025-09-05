import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import LoadingButton from "components/Buttons/LoadingButton";

interface CancelConfirmDialogProps {
  open: boolean;
  text: string | ReactElement;
  handleCancel: () => void;
  handleConfirm: () => Promise<void> | void;
  buttonIdCancel?: string;
  buttonIdConfirm?: string;
  buttonLabelCancel?: string;
  buttonLabelConfirm?: string;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
}

/**
 * Dialog to cancel or confirm an action
 */
export default function CancelConfirmDialog(
  props: CancelConfirmDialogProps
): ReactElement {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const onConfirm = async (): Promise<void> => {
    setLoading(true);
    await props.handleConfirm();
    setLoading(false);
  };

  const dialogOnClose = (
    _: unknown,
    reason: "backdropClick" | "escapeKeyDown"
  ): void => {
    if (
      (reason === "backdropClick" && props.disableBackdropClick) ||
      (reason === "escapeKeyDown" && props.disableEscapeKeyDown)
    ) {
      return;
    }
    props.handleCancel();
  };

  return (
    <Dialog
      open={props.open}
      onClose={dialogOnClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {t("buttons.proceedWithCaution")}
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
