import { ReactElement } from "react";

import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { TypographyWithFont } from "utilities/fontComponents";

export default function DefinitionsCell(props: CellProps): ReactElement {
  const typographies: ReactElement[] = [];

  props.rowData.senses.forEach((sense) => {
    const text = sense.definitions.map((d) => d.text.trim()).join("; ");
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

    // Use the analysis language of the first non-empty definition, if any.
    const lang = sense.definitions.find((d) => d.text.trim())?.language;
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
