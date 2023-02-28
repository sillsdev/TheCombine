import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";

export interface MergeDupContinueDialogProps {
  onSelection: (shouldContinue: boolean) => void;
}

export function MergeDupContinueDialog(
  props: MergeDupContinueDialogProps
): ReactElement {
  const [open, setOpen] = React.useState<boolean>(true);
  const { t } = useTranslation();

  const { onSelection } = props;

  const handle = (shouldContinue: boolean): void => {
    setOpen(false);
    onSelection(shouldContinue);
  };
  const handleYes = (): void => {
    handle(true);
  };
  const handleNo = (): void => {
    handle(false);
  };

  return (
    <Dialog open={open}>
      <DialogTitle>{t("mergeDups.continueDialog.title")}</DialogTitle>
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={handleYes}
          autoFocus
        >
          {t("mergeDups.continueDialog.yes")}
        </Button>
        <Button color="secondary" variant="contained" onClick={handleNo}>
          {t("mergeDups.continueDialog.no")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
