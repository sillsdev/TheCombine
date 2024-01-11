import { ReactElement } from "react";

import { Word } from "api/models";
import { TypographyWithFont } from "utilities/fontComponents";

interface NoteCellProps {
  rowData: Word;
}

export default function NoteCell(props: NoteCellProps): ReactElement {
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
