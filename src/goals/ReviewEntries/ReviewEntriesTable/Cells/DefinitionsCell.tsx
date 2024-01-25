import { type ReactElement } from "react";

import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { TypographyWithFont } from "utilities/fontComponents";

export default function DefinitionsCell(props: CellProps): ReactElement {
  const MAX_LENGTH = 75;
  const typographies: ReactElement[] = [];

  props.word.senses.forEach((sense) => {
    let text = sense.definitions
      .map((d) => d.text.trim())
      .filter((t) => t)
      .join("; ");
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

  return <div>{typographies}</div>;
}
