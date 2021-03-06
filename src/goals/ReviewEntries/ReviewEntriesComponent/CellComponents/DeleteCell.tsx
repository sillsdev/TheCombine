import { IconButton } from "@material-ui/core";
import { Delete, RestoreFromTrash } from "@material-ui/icons";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as backend from "backend";
import DeleteDialog from "components/Buttons/DeleteDialog";
import { updateAllWords } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { StoreState } from "types";

interface DeleteCellProps {
  rowData: ReviewEntriesWord;
  delete?: (deleteIndex: string) => void;
}

export default function DeleteCell(props: DeleteCellProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const words = useSelector(
    (state: StoreState) => state.reviewEntriesState.words
  );
  const dispatch = useDispatch();

  async function deleteFrontierWord() {
    const wordId = props.rowData.id;
    await backend.deleteFrontierWord(wordId);
    const updatedWords: ReviewEntriesWord[] = [];
    for (const word of words) {
      if (word.id !== wordId) {
        updatedWords.push(word);
      }
    }
    dispatch(updateAllWords(updatedWords));
    handleClose();
  }

  function handleOpen() {
    setDialogOpen(true);
  }
  function handleClose() {
    setDialogOpen(false);
  }

  return props.delete !== undefined ? (
    <AlignedList
      key={`delete:${props.rowData.id}`}
      listId={`delete${props.rowData.id}`}
      contents={props.rowData.senses.map((value) => (
        <React.Fragment>
          <IconButton
            size="small"
            onClick={() => {
              props.delete!(value.guid);
            }}
          >
            {value.deleted ? <RestoreFromTrash /> : <Delete />}
          </IconButton>
        </React.Fragment>
      ))}
      bottomCell={SPACER}
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
