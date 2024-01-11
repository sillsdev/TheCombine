import { ReactElement } from "react";

import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesTypes";
import { TypographyWithFont } from "utilities/fontComponents";

interface VernacularCellProps {
  rowData: ReviewEntriesWord;
}

export default function VernacularCell(
  props: VernacularCellProps
): ReactElement {
  return (
    <TypographyWithFont
      id={`row-${props.rowData.id}-vernacular-text`}
      vernacular
    >
      {props.rowData.vernacular}
    </TypographyWithFont>
  );
}
