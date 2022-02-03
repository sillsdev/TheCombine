import { Grid, TextField } from "@material-ui/core";
import { Flag as FlagFilled, FlagOutlined } from "@material-ui/icons";
import { ReactElement } from "react";

import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import { themeColors } from "types/theme";

interface FlagCellProps {
  editable?: boolean;
}

export default function FlagCell(
  props: FieldParameterStandard & FlagCellProps
): ReactElement {
  return (
    <Grid container>
      <Grid>
        {props.rowData.flag.active ? (
          <FlagFilled style={{ color: themeColors.error }} />
        ) : (
          <FlagOutlined />
        )}
      </Grid>
      <Grid>
        <TextField
          id={`row-${props.rowData.id}-flag`}
          variant="outlined"
          margin="dense"
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
