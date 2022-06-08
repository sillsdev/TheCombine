import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

interface CancelConfirmDialogProps {
  open: boolean;
  textId: string;
  handleCancel: () => void;
  handleConfirm: () => void;
  buttonIdCancel?: string;
  buttonIdConfirm?: string;
}

/**
 * Dialog to cancel or confirm an action
 */
export default function CancelConfirmDialog(
  props: CancelConfirmDialogProps
): ReactElement {
  const { t } = useTranslation();

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
          {t(props.textId)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.handleCancel}
          variant="outlined"
          color="primary"
          id={props.buttonIdCancel}
        >
          {t("buttons.cancel")}
        </Button>
        <Button
          onClick={props.handleConfirm}
          variant="contained"
          color="primary"
          id={props.buttonIdConfirm}
        >
          {t("buttons.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
