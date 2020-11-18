import { IconButton } from "@material-ui/core";
import { Delete, RestoreFromTrash } from "@material-ui/icons";
import React from "react";

import * as backend from "../../../../../backend";
import DeleteDialog from "../../../../../components/Buttons/DeleteDialog";
import { ReviewEntriesWord } from "../../ReviewEntriesTypes";
import AlignedList, { SPACER } from "../AlignedList";

interface DeleteCellProps {
  rowData: ReviewEntriesWord;
  delete?: (deleteIndex: string) => void;

  // State prop
  words: ReviewEntriesWord[];

  // Dispatch prop
  updateAllWords: (words: ReviewEntriesWord[]) => void;
}

interface DeleteCellState {
  dialogOpen: boolean;
}

class DeleteCell extends React.Component<DeleteCellProps, DeleteCellState> {
  constructor(props: DeleteCellProps) {
    super(props);
    this.state = { dialogOpen: false };
  }

  async deleteFrontierWord() {
    const wordId = this.props.rowData.id;
    await backend.deleteFrontierWord(wordId);
    const updatedWords: ReviewEntriesWord[] = [];
    for (const word of this.props.words) {
      if (word.id !== wordId) {
        updatedWords.push(word);
      }
    }
    this.props.updateAllWords(updatedWords);
    this.setState({ dialogOpen: false });
  }

  handleOpen() {
    this.setState({ dialogOpen: true });
  }
  handleClose() {
    this.setState({ dialogOpen: false });
  }

  render() {
    return this.props.delete !== undefined ? (
      <AlignedList
        key={`delete:${this.props.rowData.id}`}
        listId={`delete${this.props.rowData.id}`}
        contents={this.props.rowData.senses.map((value) => (
          <React.Fragment>
            <IconButton
              size="small"
              onClick={() => {
                this.props.delete!(value.senseId);
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
        <IconButton onClick={() => this.handleOpen()}>
          <Delete />
        </IconButton>
        <DeleteDialog
          open={this.state.dialogOpen}
          textId={"reviewEntries.deleteWordWarning"}
          handleCancel={() => this.handleClose()}
          handleAccept={() => this.deleteFrontierWord()}
        />
      </React.Fragment>
    );
  }
}

export default DeleteCell;
