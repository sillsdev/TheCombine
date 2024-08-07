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

import { LoadingButton } from "components/Buttons";

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

  async function onConfirm(): Promise<void> {
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
          data-testid={props.buttonIdClose}
          id={props.buttonIdClose}
        >
          {t("buttons.cancel")}
        </Button>
        <LoadingButton
          buttonProps={{
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
