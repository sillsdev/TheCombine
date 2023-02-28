import { TextField } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";

interface VernacularCellProps {
  editable?: boolean;
}

export default function VernacularCell(
  props: FieldParameterStandard & VernacularCellProps
): ReactElement {
  const { t } = useTranslation();

  return (
    <TextField
      variant="standard"
      key={`row-${props.rowData.id}-vernacular`}
      id={`row-${props.rowData.id}-vernacular-text`}
      multiline
      value={props.value}
      error={props.value.length === 0}
      placeholder={t("reviewEntries.noVernacular")}
      InputProps={{
        readOnly: !props.editable,
        disableUnderline: !props.editable,
      }}
      // Handles editing local word
      onChange={(event) =>
        props.onRowDataChange &&
        props.onRowDataChange({
          ...props.rowData,
          vernacular: event.target.value,
        })
      }
    />
  );
}
