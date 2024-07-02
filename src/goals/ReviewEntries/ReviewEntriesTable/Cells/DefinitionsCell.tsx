import { type ReactElement } from "react";

import SensesTextSummary from "components/WordCard/SensesTextSummary";
import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

export default function DefinitionsCell(props: CellProps): ReactElement {
  return (
    <SensesTextSummary
      definitionsOrGlosses="definitions"
      maxLengthPerSense={75}
      senses={props.word.senses}
    />
  );
}
