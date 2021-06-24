import { Chip, IconButton } from "@material-ui/core";
import { Add, Delete, RestoreFromTrash } from "@material-ui/icons";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as backend from "backend";
import DeleteDialog from "components/Buttons/DeleteDialog";
import AlignedList from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import { updateAllWords } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesActions";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";

interface DeleteCellProps {
  rowData: ReviewEntriesWord;
  // If delete is defined, this is being used for senses.
  // Otherwise, it is for deleting a whole entry.
  delete?: (deleteIndex: string) => void;
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

  function addSense() {
    const senses = [...props.rowData.senses, new ReviewEntriesSense()];
    return (
      <Chip
        label={<Add />}
        onClick={() =>
          props.onRowDataChange &&
          props.onRowDataChange({ ...props.rowData, senses })
        }
      />
    );
  }

  return props.delete ? (
    <AlignedList
      key={`delete:${props.rowData.id}`}
      listId={`delete${props.rowData.id}`}
      contents={props.rowData.senses.map((value) => (
        <React.Fragment>
          <IconButton size="small" onClick={() => props.delete!(value.guid)}>
            {value.deleted ? <RestoreFromTrash /> : <Delete />}
          </IconButton>
        </React.Fragment>
      ))}
      bottomCell={addSense()}
    />
  ) : (
    <React.Fragment>
      <IconButton onClick={handleOpen}>
        <Delete />
      </IconButton>
      <DeleteDialog
        open={dialogOpen}
        textId={"reviewEntries.deleteWordWarning"}
        handleCancel={handleClose}
        handleAccept={deleteFrontierWord}
      />
    </React.Fragment>
  );
}
