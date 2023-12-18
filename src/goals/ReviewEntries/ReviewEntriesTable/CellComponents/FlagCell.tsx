import { ReactElement } from "react";

import { Flag } from "api/models";
import FlagButton from "components/Buttons/FlagButton";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesTable/CellColumns";

interface FlagCellProps extends FieldParameterStandard {
  editable?: boolean;
}

export default function FlagCell(props: FlagCellProps): ReactElement {
  function updateFlag(flag: Flag): void {
    if (props.onRowDataChange) {
      props.onRowDataChange({ ...props.rowData, flag });
    }
  }
  return (
    <FlagButton
      flag={props.value}
      updateFlag={props.editable ? updateFlag : undefined}
      buttonId={`row-${props.rowData.id}-flag`}
    />
  );
}
