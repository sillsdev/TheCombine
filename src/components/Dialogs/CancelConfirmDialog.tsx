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
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.handleCancel}
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
          color="primary"
          disabled={loading}
          id={props.buttonIdCancel}
          onClick={props.handleCancel}
          variant="outlined"
        >
          {t("buttons.cancel")}
        </Button>
        <LoadingButton
          buttonProps={{ id: props.buttonIdConfirm, onClick: onConfirm }}
          loading={loading}
        >
          {t("buttons.confirm")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
