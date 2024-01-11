import { ReactElement } from "react";

import { Word } from "api/models";
import FlagButton from "components/Buttons/FlagButton";

interface FlagCellProps {
  rowData: Word;
}

export default function FlagCell(props: FlagCellProps): ReactElement {
  return (
    <FlagButton
      flag={props.rowData.flag}
      buttonId={`row-${props.rowData.id}-flag`}
    />
  );
}
