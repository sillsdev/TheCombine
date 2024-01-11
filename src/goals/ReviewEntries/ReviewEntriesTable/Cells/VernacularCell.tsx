import { ReactElement } from "react";

import { Word } from "api/models";
import { TypographyWithFont } from "utilities/fontComponents";

interface VernacularCellProps {
  rowData: Word;
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
