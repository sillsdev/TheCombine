import { Button } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { CancelConfirmDialog } from "components/Dialogs";

interface UndoButtonProps {
  buttonIdEnabled?: string;
  buttonIdCancel?: string;
  buttonIdConfirm?: string;
  buttonLabelEnabled?: string;
  textIdDialog: string;
  textIdDisabled: string;
  textIdEnabled: string;
  isUndoAllowed: () => Promise<boolean>;
  undo: () => Promise<void>;
}

export default function UndoButton(props: UndoButtonProps): ReactElement {
  const isUndoAllowed = props.isUndoAllowed;

  const [isUndoEnabled, setUndoEnabled] = useState(false);
  const [undoDialogOpen, setUndoDialogOpen] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (!undoDialogOpen) {
      isUndoAllowed().then(setUndoEnabled);
    }
  }, [isUndoAllowed, undoDialogOpen]);

  return isUndoEnabled ? (
    <>
      <Button
        aria-label={props.buttonLabelEnabled ?? "Undo"}
        data-testid={props.buttonIdEnabled}
        id={props.buttonIdEnabled}
        onClick={() => setUndoDialogOpen(true)}
        variant="outlined"
      >
        {t(props.textIdEnabled)}
      </Button>
      <CancelConfirmDialog
        open={undoDialogOpen}
        text={props.textIdDialog}
        handleCancel={() => setUndoDialogOpen(false)}
        handleConfirm={() => props.undo().then(() => setUndoDialogOpen(false))}
        buttonIdCancel={props.buttonIdCancel}
        buttonIdConfirm={props.buttonIdConfirm}
      />
    </>
  ) : (
    <Button disabled>{t(props.textIdDisabled)}</Button>
  );
}
