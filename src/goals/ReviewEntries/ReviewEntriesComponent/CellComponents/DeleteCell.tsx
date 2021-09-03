import { IconButton } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as backend from "backend";
import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import { updateAllWords } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesActions";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";

interface DeleteCellProps {
  rowData: ReviewEntriesWord;
}

export default function DeleteCell(
  props: DeleteCellProps & FieldParameterStandard
) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const words = useSelector(
    (state: StoreState) => state.reviewEntriesState.words
  );
  const dispatch = useDispatch();

  async function deleteFrontierWord() {
    const wordId = props.rowData.id;
    await backend.deleteFrontierWord(wordId);
    const updatedWords = words.filter((w) => w.id !== wordId);
    dispatch(updateAllWords(updatedWords));
    handleClose();
  }

  function handleOpen() {
    setDialogOpen(true);
  }
  function handleClose() {
    setDialogOpen(false);
  }

  return (
    <React.Fragment>
      <IconButton onClick={handleOpen} id={`row-${props.rowData.id}-delete`}>
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
