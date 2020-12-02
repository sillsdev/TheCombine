import { IconButton, Tooltip } from "@material-ui/core";
import { AddComment, Comment } from "@material-ui/icons";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";

import EditTextDialog from "../../../Buttons/EditTextDialog";

interface EntryNoteProps {
  noteText: string;
  updateNote: (newText: string) => void;
}

/**
 * A note adding/editing button
 */
export default function EntryNote(props: EntryNoteProps) {
  const [noteOpen, setNoteOpen] = useState<boolean>(false);

  return (
    <React.Fragment>
      {props.noteText ? (
        <Tooltip title={props.noteText} placement="top">
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
        text={props.noteText}
        titleId={"addWords.addNote"}
        close={() => setNoteOpen(false)}
        updateText={props.updateNote}
      />
    </React.Fragment>
  );
}
