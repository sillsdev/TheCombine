import { ReactElement } from "react";

import FlagButton from "components/Buttons/FlagButton";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesTypes";

interface FlagCellProps {
  rowData: ReviewEntriesWord;
}

export default function FlagCell(props: FlagCellProps): ReactElement {
  return (
    <FlagButton
      flag={props.rowData.flag}
      buttonId={`row-${props.rowData.id}-flag`}
    />
  );
}
