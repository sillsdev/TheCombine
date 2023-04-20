import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import LoadingButton from "components/Buttons/LoadingButton";

interface ButtonConfirmationProps {
  open: boolean;
  textId: string;
  titleId: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  buttonIdClose?: string;
  buttonIdConfirm?: string;
}

/**
 * Dialog for a button to confirm or cancel its click action
 */
export default function ButtonConfirmation(
  props: ButtonConfirmationProps
): ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  async function onConfirm() {
    setLoading(true);
    await props.onConfirm();
    setLoading(false);
    props.onClose();
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
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
          onClick={props.onClose}
          variant="outlined"
          color="primary"
          id={props.buttonIdClose}
        >
          {t("buttons.cancel")}
        </Button>
        <LoadingButton
          loading={loading}
          buttonProps={{
            onClick: onConfirm,
            color: "primary",
            variant: "contained",
            id: props.buttonIdConfirm,
          }}
        >
          {t("buttons.confirm")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
