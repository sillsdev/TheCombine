import { type ReactElement } from "react";

import FlagButton from "components/Buttons/FlagButton";
import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

export default function FlagCell(props: CellProps): ReactElement {
  return (
    <FlagButton flag={props.word.flag} buttonId={`row-${props.word.id}-flag`} />
  );
}
