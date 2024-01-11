import { ReactElement } from "react";

import { Word } from "api/models";
import { TypographyWithFont } from "utilities/fontComponents";

interface DefinitionsCellProps {
  rowData: Word;
}

export default function DefinitionsCell(
  props: DefinitionsCellProps
): ReactElement {
  const defs: ReactElement[] = [];

  props.rowData.senses.forEach((sense, index) => {
    if (index) {
      defs.push(
        <TypographyWithFont analysis display="inline" key={sense.guid}>
          {" | "}
        </TypographyWithFont>
      );
    }

    sense.definitions.forEach((d, i) => {
      if (i) {
        defs.push(
          <TypographyWithFont
            analysis
            display="inline"
            key={`${sense.guid}-${i}-sep`}
          >
            {"; "}
          </TypographyWithFont>
        );
      }

      defs.push(
        <TypographyWithFont
          analysis
          display="inline"
          key={`${sense.guid}-${i}-text`}
          lang={d.language}
        >
          {d.text}
        </TypographyWithFont>
      );
    });
  });

  return <>{defs}</>;
}
