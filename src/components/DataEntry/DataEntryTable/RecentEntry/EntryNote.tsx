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

/**
 * A note adding/editing button
 */
export default function EntryNote(props: EntryNoteProps) {
  const [noteOpen, setNoteOpen] = React.useState<boolean>(false);

  return (
    <React.Fragment>
      {props.entry.note.text ? (
        <Tooltip title={props.entry.note.text} placement="top">
          <IconButton size="small" onClick={() => setNoteOpen(true)}>
            <Comment />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title={<Translate id="addWords.addNote" />} placement="top">
          <IconButton size="small" onClick={() => setNoteOpen(true)}>
            <AddComment />
          </IconButton>
        </Tooltip>
      )}
      <EditTextDialog
        open={noteOpen}
        text={props.entry.note.text}
        titleId={"addWords.addNote"}
        close={() => setNoteOpen(false)}
        updateText={props.updateNote}
      />
    </React.Fragment>
  );
}
