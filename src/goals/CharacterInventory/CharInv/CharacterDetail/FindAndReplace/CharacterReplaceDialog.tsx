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

interface ReplaceDialogProps {
  open: boolean;
  dialogFindValue: string;
  dialogReplaceValue: string;
  handleAccept: () => Promise<void>;
  handleCancel: () => void;
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
    await props.handleAccept();
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
        <Button onClick={props.handleCancel} variant="outlined" color="primary">
          {t("buttons.cancel")}
        </Button>
        <LoadingButton
          loading={loading}
          buttonProps={{ onClick: submitFindAndReplace, color: "primary" }}
        >
          {t("buttons.confirm")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
