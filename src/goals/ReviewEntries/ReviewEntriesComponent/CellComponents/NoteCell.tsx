import { TextField } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";

export default function NoteCell(props: FieldParameterStandard): ReactElement {
  const { t } = useTranslation();

  return (
    <TextField
      variant="standard"
      key={`row-${props.rowData.id}-note`}
      id={`row-${props.rowData.id}-note-text`}
      multiline
      value={props.value}
      placeholder={t("reviewEntries.noNote")}
      // Handles editing local word
      onChange={(event) =>
        props.onRowDataChange &&
        props.onRowDataChange({
          ...props.rowData,
          noteText: event.target.value,
        })
      }
    />
  );
}
