import { TextField } from "@material-ui/core";
import { ReactElement } from "react";
import { Translate } from "react-localize-redux";

import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";

interface VernacularCellProps {
  editable?: boolean;
}

export default function VernacularCell(
  props: FieldParameterStandard & VernacularCellProps
): ReactElement {
  return (
    <Translate>
      {({ translate }): ReactElement => (
        <TextField
          key={`row-${props.rowData.id}-vernacular`}
          id={`row-${props.rowData.id}-vernacular-text`}
          multiline
          value={props.value}
          error={props.value.length === 0}
          placeholder={translate("reviewEntries.noVernacular").toString()}
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
      )}
    </Translate>
  );
}
