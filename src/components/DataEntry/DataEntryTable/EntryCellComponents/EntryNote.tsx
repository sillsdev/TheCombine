import { AddComment, Comment } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { EditTextDialog } from "components/Dialogs";

interface EntryNoteProps {
  buttonId: string;
  noteText: string;
  updateNote?: (newText: string) => void | Promise<void>;
}

/**
 * A note adding/editing button
 */
export default function EntryNote(props: EntryNoteProps) {
  const [noteOpen, setNoteOpen] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleClick = (): void => {
    if (!props.updateNote) {
      setNoteOpen(true);
    }
  };

  return (
    <React.Fragment>
      <Tooltip
        title={props.noteText ? props.noteText : t("addWords.addNote")}
        placement="top"
      >
        <IconButton size="small" onClick={handleClick} id={props.buttonId}>
          {props.noteText ? <Comment /> : <AddComment />}
        </IconButton>
      </Tooltip>
      <EditTextDialog
        open={noteOpen}
        text={props.noteText}
        titleId={"addWords.addNote"}
        close={() => setNoteOpen(false)}
        updateText={props.updateNote ?? (() => {})}
        buttonIdCancel="note-edit-cancel"
        buttonIdConfirm="note-edit-confirm"
        textFieldId="note-text-field"
      />
    </React.Fragment>
  );
}
