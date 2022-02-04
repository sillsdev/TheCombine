import { TextField } from "@material-ui/core";
import { ReactElement } from "react";
import { Translate } from "react-localize-redux";

import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";

export default function NoteCell(props: FieldParameterStandard): ReactElement {
  return (
    <Translate>
      {({ translate }): ReactElement => (
        <TextField
          key={`row-${props.rowData.id}-note`}
          id={`row-${props.rowData.id}-note-text`}
          multiline
          value={props.value}
          placeholder={translate("reviewEntries.noNote").toString()}
          // Handles editing local word
          onChange={(event) =>
            props.onRowDataChange &&
            props.onRowDataChange({
              ...props.rowData,
              noteText: event.target.value,
            })
          }
        />
      )}
    </Translate>
  );
}
