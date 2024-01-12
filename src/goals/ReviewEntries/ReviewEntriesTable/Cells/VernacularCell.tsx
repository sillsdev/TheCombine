import { ReactElement } from "react";

import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { TypographyWithFont } from "utilities/fontComponents";

export default function VernacularCell(props: CellProps): ReactElement {
  return (
    <TypographyWithFont
      id={`row-${props.rowData.id}-vernacular-text`}
      vernacular
    >
      {props.rowData.vernacular}
    </TypographyWithFont>
  );
}
