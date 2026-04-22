import { type ReactElement } from "react";

import SensesTextSummary from "components/WordCard/SensesTextSummary";
import { type ReadonlyCellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

export default function DefinitionsCell(
  props: ReadonlyCellProps
): ReactElement {
  return (
    <SensesTextSummary
      definitionsOrGlosses="definitions"
      maxLengthPerSense={75}
      senses={props.word.senses}
    />
  );
}
