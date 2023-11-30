import { Delete } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { deleteFrontierWord as deleteFromBackend } from "backend";
import { CancelConfirmDialog } from "components/Dialogs";
import { deleteWord } from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesTypes";
import { useAppDispatch } from "types/hooks";

interface DeleteCellProps {
  rowData: ReviewEntriesWord;
}

export default function DeleteCell(props: DeleteCellProps): ReactElement {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const word = props.rowData;
  const disabled = word.protected || !!word.senses.find((s) => s.protected);

  async function deleteFrontierWord(): Promise<void> {
    await deleteFromBackend(word.id);
    dispatch(deleteWord(word.id));
    handleClose();
  }

  function handleOpen(): void {
    setDialogOpen(true);
  }
  function handleClose(): void {
    setDialogOpen(false);
  }

  return (
    <>
      <Tooltip
        title={disabled ? t("reviewEntries.deleteDisabled") : ""}
        placement={document.body.dir === "rtl" ? "right" : "left"}
      >
        <span>
          <IconButton
            onClick={handleOpen}
            id={`row-${props.rowData.id}-delete`}
            size="large"
            disabled={disabled}
          >
            <Delete />
          </IconButton>
        </span>
      </Tooltip>
      <CancelConfirmDialog
        open={dialogOpen}
        textId={"reviewEntries.deleteWordWarning"}
        handleCancel={handleClose}
        handleConfirm={deleteFrontierWord}
        buttonIdCancel="row-delete-cancel"
        buttonIdConfirm="row-delete-confirm"
      />
    </>
  );
}
