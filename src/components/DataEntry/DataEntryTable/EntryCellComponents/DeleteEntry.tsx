import { Delete } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import CancelConfirmDialog from "components/Dialogs/CancelConfirmDialog";

interface DeleteEntryProps {
  removeEntry: () => void;
  buttonId: string;
  buttonLabel?: string;
  // confirmId is the translation id for the text of the delete confirmation popup;
  // if no confirmId is specified, then there is no popup
  // and deletion will happen when the button is pressed
  confirmId?: string;
  disabled?: boolean;
}

/**
 * A delete button
 */
export default function DeleteEntry(props: DeleteEntryProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const { t } = useTranslation();

  function handleClick(): void {
    if (props.confirmId) {
      setOpen(true);
    } else {
      props.removeEntry();
    }
  }

  return (
    <>
      <Tooltip title={t("addWords.deleteRow")} placement="top">
        <IconButton
          aria-label={props.buttonLabel ?? "Delete entry"}
          data-testid={props.buttonId}
          disabled={props.disabled}
          tabIndex={-1}
          size="small"
          onClick={handleClick}
          id={props.buttonId}
        >
          <Delete />
        </IconButton>
      </Tooltip>
      <CancelConfirmDialog
        open={open}
        text={props.confirmId || "buttons.deletePermanently"}
        handleCancel={() => setOpen(false)}
        handleConfirm={() => {
          setOpen(false);
          props.removeEntry();
        }}
        buttonIdCancel="delete-word-cancel"
        buttonIdConfirm="delete-word-confirm"
      />
    </>
  );
}
