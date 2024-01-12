import { ReactElement } from "react";

import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { TypographyWithFont } from "utilities/fontComponents";

export default function NoteCell(props: CellProps): ReactElement {
  return (
    <TypographyWithFont
      analysis
      id={`row-${props.rowData.id}-note`}
      lang={props.rowData.note.language}
    >
      {props.rowData.note.text}
    </TypographyWithFont>
  );
}
