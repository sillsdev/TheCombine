import { type ReactElement } from "react";

import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { TypographyWithFont } from "utilities/fontComponents";

export default function VernacularCell(props: CellProps): ReactElement {
  return (
    <TypographyWithFont id={`row-${props.word.id}-vernacular`} vernacular>
      {props.word.vernacular}
    </TypographyWithFont>
  );
}
