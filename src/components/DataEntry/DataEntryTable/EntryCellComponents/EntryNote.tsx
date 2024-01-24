import { AddComment, Comment } from "@mui/icons-material";
import { type ReactElement, useState } from "react";

import { IconButtonWithTooltip } from "components/Buttons";
import { EditTextDialog } from "components/Dialogs";

interface EntryNoteProps {
  noteText: string;
  buttonId?: string;
  updateNote?: (newText: string) => void | Promise<void>;
}

/** A note adding/editing/viewing button */
export default function EntryNote(props: EntryNoteProps): ReactElement {
  const [noteOpen, setNoteOpen] = useState<boolean>(false);

  return (
    <>
      <IconButtonWithTooltip
        buttonId={props.buttonId ?? "entry-note-button"}
        icon={
          props.noteText ? (
            <Comment sx={{ color: (t) => t.palette.grey[700] }} />
          ) : (
            <AddComment sx={{ color: (t) => t.palette.grey[700] }} />
          )
        }
        onClick={props.updateNote ? () => setNoteOpen(true) : undefined}
        side="top"
        size="small"
        text={props.noteText}
        textId="addWords.addNote"
      />
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
    </>
  );
}
