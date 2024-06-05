import { type ReactElement } from "react";

import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { TypographyWithFont } from "utilities/fontComponents";

export default function NoteCell(props: CellProps): ReactElement {
  const MAX_LENGTH = 100;
  let text = props.word.note.text;
  if (text.length > MAX_LENGTH) {
    text = `${text.substring(0, MAX_LENGTH)}[...]`;
  }
  return (
    <TypographyWithFont
      analysis
      id={`row-${props.word.id}-note`}
      lang={props.word.note.language}
    >
      {text}
    </TypographyWithFont>
  );
}
