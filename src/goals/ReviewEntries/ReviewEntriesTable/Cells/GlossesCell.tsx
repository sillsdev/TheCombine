import { ReactElement } from "react";

import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { TypographyWithFont } from "utilities/fontComponents";

export default function GlossesCell(props: CellProps): ReactElement {
  const typographies: ReactElement[] = [];

  props.rowData.senses.forEach((sense) => {
    const text = sense.glosses.map((g) => g.def.trim()).join("; ");
    if (!text) {
      return;
    }

    // Add a sense separator if this isn't the first.
    if (typographies.length) {
      typographies.push(
        <TypographyWithFont analysis display="inline" key={`${sense.guid}-sep`}>
          {" | "}
        </TypographyWithFont>
      );
    }

    // Use the analysis language of the first non-empty gloss, if any.
    const lang = sense.glosses.find((g) => g.def.trim())?.language;
    typographies.push(
      <TypographyWithFont
        analysis
        display="inline"
        key={`${sense.guid}-text`}
        lang={lang}
      >
        {text}
      </TypographyWithFont>
    );
  });

  return <>{typographies}</>;
}
