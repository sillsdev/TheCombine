import { ReactElement } from "react";

import FlagButton from "components/Buttons/FlagButton";
import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

export default function FlagCell(props: CellProps): ReactElement {
  return (
    <FlagButton
      flag={props.rowData.flag}
      buttonId={`row-${props.rowData.id}-flag`}
    />
  );
}
