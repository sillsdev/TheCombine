import { type ReactElement } from "react";

import { type ReadonlyCellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { TypographyWithFont } from "utilities/fontComponents";

export default function VernacularCell(props: ReadonlyCellProps): ReactElement {
  return (
    <TypographyWithFont id={`row-${props.word.id}-vernacular`} vernacular>
      {props.word.vernacular}
    </TypographyWithFont>
  );
}
