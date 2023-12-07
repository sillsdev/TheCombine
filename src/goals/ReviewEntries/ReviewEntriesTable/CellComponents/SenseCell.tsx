import { Add, Delete, RestoreFromTrash } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { ReactElement } from "react";

import { IconButtonWithTooltip } from "components/Buttons";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesTable/CellColumns";
import AlignedList from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/AlignedList";
import { ReviewEntriesSense } from "goals/ReviewEntries/ReviewEntriesTypes";

interface SenseCellProps extends FieldParameterStandard {
  delete: (deleteIndex: string) => void;
}

export default function SenseCell(props: SenseCellProps): ReactElement {
  function addSense(): ReactElement {
    const senses = [...props.rowData.senses, new ReviewEntriesSense()];
    return (
      <Chip
        id={`row-${props.rowData.id}-sense-add`}
        label={<Add />}
        onClick={() =>
          props.onRowDataChange &&
          props.onRowDataChange({ ...props.rowData, senses })
        }
      />
    );
  }

  return (
    <AlignedList
      listId={`delete${props.rowData.id}`}
      contents={props.rowData.senses.map((sense) => (
        <IconButtonWithTooltip
          buttonId={`sense-${sense.guid}-delete`}
          icon={sense.deleted ? <RestoreFromTrash /> : <Delete />}
          key={sense.guid}
          onClick={
            sense.protected ? undefined : () => props.delete!(sense.guid)
          }
          size="small"
          textId={sense.protected ? "reviewEntries.deleteDisabled" : undefined}
        />
      ))}
      bottomCell={addSense()}
    />
  );
}
