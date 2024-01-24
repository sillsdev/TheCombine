import { ReactElement } from "react";

import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { TypographyWithFont } from "utilities/fontComponents";

export default function GlossesCell(props: CellProps): ReactElement {
  const MAX_LENGTH = 50;
  const typographies: ReactElement[] = [];

  props.rowData.senses.forEach((sense) => {
    let text = sense.glosses.map((g) => g.def.trim()).join("; ");
    if (!text) {
      return;
    }

    if (text.length > MAX_LENGTH) {
      text = `${text.substring(0, MAX_LENGTH)}[...]`;
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

  return <div>{typographies}</div>;
}
