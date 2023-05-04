import { Add, Delete, RestoreFromTrash } from "@mui/icons-material";
import { Chip, IconButton, Tooltip } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";
import AlignedList from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { ReviewEntriesSense } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

interface SenseCellProps {
  delete: (deleteIndex: string) => void;
}

export default function SenseCell(
  props: SenseCellProps & FieldParameterStandard
): ReactElement {
  const { t } = useTranslation();

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
      key={`delete:${props.rowData.id}`}
      listId={`delete${props.rowData.id}`}
      contents={props.rowData.senses.map((sense) => (
        <Tooltip
          title={sense.protected ? t("reviewEntries.deleteDisabled") : ""}
          placement="right"
          key={sense.guid}
        >
          <span>
            <IconButton
              size="small"
              onClick={() => props.delete!(sense.guid)}
              id={`sense-${sense.guid}-delete`}
              disabled={sense.protected}
            >
              {sense.deleted ? <RestoreFromTrash /> : <Delete />}
            </IconButton>
          </span>
        </Tooltip>
      ))}
      bottomCell={addSense()}
    />
  );
}
