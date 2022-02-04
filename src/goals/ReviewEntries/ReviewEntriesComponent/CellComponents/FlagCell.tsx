import { Grid, TextField } from "@material-ui/core";
import { ReactElement } from "react";

import { Flag } from "api/models";
import FlagButton from "components/Buttons/FlagButton";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";

interface FlagCellProps {
  editable?: boolean;
}

export default function FlagCell(
  props: FieldParameterStandard & FlagCellProps
): ReactElement {
  function updateFlag(flag: Flag): void {
    if (props.onRowDataChange) {
      props.onRowDataChange({ ...props.rowData, flag });
    }
  }
  return (
    <Grid container>
      <Grid>
        <FlagButton
          flag={props.value}
          updateFlag={updateFlag}
          buttonId={`row-${props.rowData.id}-flag`}
        />
      </Grid>
      <Grid>
        <TextField
          id={`row-${props.rowData.id}-flag-text`}
          disabled={!props.editable}
          variant="outlined"
          multiline
          value={props.rowData.flag.text}
          onChange={(event) =>
            props.onRowDataChange &&
            props.onRowDataChange({
              ...props.rowData,
              flag: {
                active: props.rowData.flag.active || !!event.target.value,
                text: event.target.value,
              },
            })
          }
        />
      </Grid>
    </Grid>
  );
}
