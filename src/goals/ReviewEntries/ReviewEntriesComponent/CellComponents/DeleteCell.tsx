import { Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React, { ReactElement, useState } from "react";

import { deleteFrontierWord as deleteFromBackend } from "backend";
import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import { updateAllWords } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesActions";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
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

  async function deleteFrontierWord(): Promise<void> {
    const wordId = props.rowData.id;
    await deleteFromBackend(wordId);
    const updatedWords = words.filter((w) => w.id !== wordId);
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
      <IconButton
        onClick={handleOpen}
        id={`row-${props.rowData.id}-delete`}
        size="large"
      >
        <Delete />
      </IconButton>
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
