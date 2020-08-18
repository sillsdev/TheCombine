import React from "react";
import { IconButton } from "@material-ui/core";
import { Delete } from "@material-ui/icons";

import AlignedList, { SPACER } from "../AlignedList";
import { ReviewEntriesWord } from "../../ReviewEntriesTypes";
import * as backend from "../../../../../backend";

interface DeleteCellProps {
  rowData: ReviewEntriesWord;
  delete?: (deleteIndex: string) => void;

  // State prop
  words: ReviewEntriesWord[];

  // Dispatch prop
  updateAllWords: (words: ReviewEntriesWord[]) => void;
}

class DeleteCell extends React.Component<DeleteCellProps> {
  async deleteFrontierWord(wordId: string) {
    await backend.deleteFrontierWord(wordId);
    let updatedWords: ReviewEntriesWord[] = [];
    for (let word of this.props.words) {
      if (word.id !== wordId) {
        updatedWords.push(word);
      }
    }
    this.props.updateAllWords(updatedWords);
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
              <Delete />
            </IconButton>
          </React.Fragment>
        ))}
        bottomCell={SPACER}
      />
    ) : (
      <IconButton
        onClick={() => this.deleteFrontierWord(this.props.rowData.id)}
      >
        <Delete />
      </IconButton>
    );
  }
}

export default DeleteCell;
