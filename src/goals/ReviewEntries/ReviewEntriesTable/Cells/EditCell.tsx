import { Edit } from "@mui/icons-material";
import { ReactElement, useState } from "react";

import { IconButtonWithTooltip } from "components/Buttons";
import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import EditDialog from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditDialog";

const buttonId = (wordId: string): string => `row-${wordId}-edit`;

export default function DeleteCell(props: CellProps): ReactElement {
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
        textId={"reviewEntries.materialTable.body.edit"}
      />
      <EditDialog
        cancel={() => setOpen(false)}
        confirm={handleConfirm}
        open={open}
        word={props.word}
      />
    </>
  );
}
