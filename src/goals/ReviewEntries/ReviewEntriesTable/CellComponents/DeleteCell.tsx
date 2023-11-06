import { Delete } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { deleteFrontierWord as deleteFromBackend } from "backend";
import { CancelConfirmDialog } from "components/Dialogs";
import { updateAllWords } from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

interface DeleteCellProps {
  rowData: ReviewEntriesWord;
}

export default function DeleteCell(props: DeleteCellProps): ReactElement {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const words = useAppSelector(
    (state: StoreState) => state.reviewEntriesState.words
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const word = props.rowData;
  const disabled = word.protected || !!word.senses.find((s) => s.protected);

  async function deleteFrontierWord(): Promise<void> {
    await deleteFromBackend(word.id);
    const updatedWords = words.filter((w) => w.id !== word.id);
    dispatch(updateAllWords(updatedWords));
    handleClose();
  }

  function handleOpen(): void {
    setDialogOpen(true);
  }
  function handleClose(): void {
    setDialogOpen(false);
  }

  return (
    <React.Fragment>
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
    </React.Fragment>
  );
}
