import { Edit } from "@mui/icons-material";
import { type ReactElement, useState } from "react";

import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import EditDialog from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditDialog";

const buttonId = (wordId: string): string => `row-${wordId}-edit`;

export default function EditCell(props: CellProps): ReactElement {
  const [open, setOpen] = useState(false);

  const handleConfirm = async (newId: string): Promise<void> => {
    if (props.replace) {
      await props.replace(props.word.id, newId);
    }
  };

  return (
    <>
      <IconButtonWithTooltip
        buttonId={buttonId(props.word.id)}
        icon={<Edit />}
        onClick={() => setOpen(true)}
        textId={"reviewEntries.columns.edit"}
      />
      {
        /* Only render EditDialog when `open` is `true`
         * to ensure that its `word` prop is not stale from a previous edit. */
        open && (
          <EditDialog
            close={() => setOpen(false)}
            confirm={handleConfirm}
            word={props.word}
          />
        )
      }
    </>
  );
}
