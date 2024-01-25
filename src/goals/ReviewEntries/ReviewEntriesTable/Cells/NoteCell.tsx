import { type ReactElement } from "react";

import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { TypographyWithFont } from "utilities/fontComponents";

export default function NoteCell(props: CellProps): ReactElement {
  return (
    <TypographyWithFont
      analysis
      id={`row-${props.word.id}-note`}
      lang={props.word.note.language}
    >
      {props.word.note.text}
    </TypographyWithFont>
  );
}
