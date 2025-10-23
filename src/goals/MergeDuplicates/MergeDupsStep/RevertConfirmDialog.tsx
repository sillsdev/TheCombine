import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

export interface RevertConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RevertConfirmDialog(
  props: RevertConfirmDialogProps
): ReactElement {
  const { t } = useTranslation();

  return (
    <Dialog open onClose={props.onCancel}>
      <DialogTitle>{t("mergeDups.helpText.revertSetDialog")}</DialogTitle>
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={props.onConfirm}
          id="revert-confirm"
        >
          {t("buttons.confirm")}
        </Button>
        <Button
          color="secondary"
          variant="contained"
          onClick={props.onCancel}
          id="revert-cancel"
          autoFocus
        >
          {t("buttons.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
