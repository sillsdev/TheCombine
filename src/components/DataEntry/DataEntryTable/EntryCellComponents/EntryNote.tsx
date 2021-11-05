import { IconButton, Tooltip } from "@material-ui/core";
import { AddComment, Comment } from "@material-ui/icons";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";

import EditTextDialog from "components/Buttons/EditTextDialog";

interface EntryNoteProps {
  noteText: string;
  updateNote: (newText: string) => void | Promise<void>;
  buttonId: string;
}

/**
 * A note adding/editing button
 */
export default function EntryNote(props: EntryNoteProps) {
  const [noteOpen, setNoteOpen] = useState<boolean>(false);

  return (
    <React.Fragment>
      <Tooltip
        title={
          props.noteText ? props.noteText : <Translate id="addWords.addNote" />
        }
        placement="top"
      >
        <IconButton
          size="small"
          onClick={() => setNoteOpen(true)}
          id={props.buttonId}
        >
          {props.noteText ? <Comment /> : <AddComment />}
        </IconButton>
      </Tooltip>
      <EditTextDialog
        open={noteOpen}
        text={props.noteText}
        titleId={"addWords.addNote"}
        close={() => setNoteOpen(false)}
        updateText={props.updateNote}
        buttonIdCancel="note-edit-cancel"
        buttonIdConfirm="note-edit-confirm"
        textFieldId="note-text-field"
      />
    </React.Fragment>
  );
}
