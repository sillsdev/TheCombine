import { type ReactElement } from "react";

import SensesTextSummary from "components/WordCard/SensesTextSummary";
import { type ReadonlyCellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

export default function GlossesCell(props: ReadonlyCellProps): ReactElement {
  return (
    <SensesTextSummary
      definitionsOrGlosses="glosses"
      maxLengthPerSense={50}
      senses={props.word.senses}
    />
  );
}
