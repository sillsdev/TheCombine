import { IconButton, Tooltip } from "@material-ui/core";
import { AddComment, Comment } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";

import { Word } from "../../../../types/word";
import EditTextDialog from "../../../Buttons/EditTextDialog";

interface EntryNoteProps {
  entry: Word;
  updateNote: (newText: string) => void;
}

interface EntryNoteState {
  noteOpen: boolean;
}

/**
 * A note adding/editing button
 */
export default class EntryNote extends React.Component<
  EntryNoteProps,
  EntryNoteState
> {
  constructor(props: EntryNoteProps) {
    super(props);
    this.state = { noteOpen: false };
  }

  render() {
    return (
      <React.Fragment>
        {this.props.entry.note.text ? (
          <Tooltip title={this.props.entry.note.text} placement="top">
            <IconButton
              size="small"
              onClick={() => this.setState({ noteOpen: true })}
            >
              <Comment />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={<Translate id="addWords.addNote" />} placement="top">
            <IconButton
              size="small"
              onClick={() => this.setState({ noteOpen: true })}
            >
              <AddComment />
            </IconButton>
          </Tooltip>
        )}
        <EditTextDialog
          open={this.state.noteOpen}
          text={this.props.entry.note.text}
          titleId={"addWords.addNote"}
          close={() => this.setState({ noteOpen: false })}
          updateText={this.props.updateNote}
        />
      </React.Fragment>
    );
  }
}
