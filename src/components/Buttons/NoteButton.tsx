import { AddComment, Comment } from "@mui/icons-material";
import { type ReactElement, useState } from "react";

import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { EditTextDialog } from "components/Dialogs";

interface NoteButtonProps {
  buttonId?: string;
  disabled?: boolean;
  noteText: string;
  updateNote?: (newText: string) => void | Promise<void>;
}

/** A note adding/editing/viewing button */
export default function NoteButton(props: NoteButtonProps): ReactElement {
  const [noteOpen, setNoteOpen] = useState<boolean>(false);

  return (
    <>
      <IconButtonWithTooltip
        buttonId={props.buttonId ?? "entry-note-button"}
        disabled={props.disabled}
        icon={
          props.noteText ? (
            <Comment
              sx={{ color: (t) => t.palette.grey[props.disabled ? 400 : 700] }}
            />
          ) : (
            <AddComment
              sx={{ color: (t) => t.palette.grey[props.disabled ? 400 : 700] }}
            />
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
