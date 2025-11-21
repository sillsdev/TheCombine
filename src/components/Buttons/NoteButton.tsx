import { AddComment, Comment } from "@mui/icons-material";
import { type ReactElement, useState } from "react";

import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import EditTextDialog from "components/Dialogs/EditTextDialog";

interface NoteButtonProps {
  buttonId?: string;
  buttonLabel?: string;
  disabled?: boolean;
  /** If `noteText` is empty and `updateNote` defined,
   * the button will have default add-note hover text. */
  noteText: string;
  onExited?: () => void;
  updateNote?: (newText: string) => void | Promise<void>;
}

/** A note adding/editing/viewing button */
export default function NoteButton(props: NoteButtonProps): ReactElement {
  const [noteOpen, setNoteOpen] = useState<boolean>(false);

  return (
    <>
      <IconButtonWithTooltip
        buttonId={props.buttonId}
        buttonLabel={props.buttonLabel ?? "Note"}
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
        text={props.noteText || undefined}
        textId={props.updateNote ? "addWords.addNote" : undefined}
      />
      <EditTextDialog
        open={noteOpen}
        text={props.noteText}
        titleId={"addWords.addNote"}
        close={() => setNoteOpen(false)}
        onExited={props.onExited}
        updateText={props.updateNote ?? (() => {})}
        buttonIdCancel="note-edit-cancel"
        buttonIdClear="note-edit-clear"
        buttonIdConfirm="note-edit-confirm"
        textFieldId="note-text-field"
      />
    </>
  );
}
