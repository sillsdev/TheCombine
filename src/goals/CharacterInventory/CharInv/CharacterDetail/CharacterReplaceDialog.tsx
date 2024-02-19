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

import { LoadingButton } from "components/Buttons";

interface ReplaceDialogProps {
  open: boolean;
  dialogFindValue: string;
  dialogReplaceValue: string;
  handleCancel: () => void;
  handleConfirm: () => Promise<void>;
  idCancel?: string;
  idConfirm?: string;
}

/**
 * Dialog to confirm replacement
 */
export default function CharacterReplaceDialog(
  props: ReplaceDialogProps
): ReactElement {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function submitFindAndReplace(): Promise<void> {
    setLoading(true);
    await props.handleConfirm();
    setLoading(false);
  }

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
          {t("charInventory.characterSet.replaceAll", {
            val: props.dialogFindValue,
          })}
          <br />
          {t("charInventory.characterSet.replaceAllWith", {
            val: props.dialogReplaceValue,
          })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          id={props.idCancel}
          onClick={props.handleCancel}
          variant="outlined"
        >
          {t("buttons.cancel")}
        </Button>
        <LoadingButton
          buttonProps={{
            color: "primary",
            id: props.idConfirm,
            onClick: submitFindAndReplace,
          }}
          loading={loading}
        >
          {t("buttons.confirm")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
