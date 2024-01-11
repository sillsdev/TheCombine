import { ReactElement } from "react";

import { Word } from "api/models";
import { TypographyWithFont } from "utilities/fontComponents";

interface GlossesCellProps {
  rowData: Word;
}

export default function GlossesCell(props: GlossesCellProps): ReactElement {
  const glosses: ReactElement[] = [];

  props.rowData.senses.forEach((sense, index) => {
    if (index) {
      glosses.push(
        <TypographyWithFont analysis display="inline" key={sense.guid}>
          {" | "}
        </TypographyWithFont>
      );
    }

    sense.glosses.forEach((g, i) => {
      if (i) {
        glosses.push(
          <TypographyWithFont
            analysis
            display="inline"
            key={`${sense.guid}-${i}-sep`}
          >
            {"; "}
          </TypographyWithFont>
        );
      }

      glosses.push(
        <TypographyWithFont
          analysis
          display="inline"
          key={`${sense.guid}-${i}-text`}
          lang={g.language}
        >
          {g.def}
        </TypographyWithFont>
      );
    });
  });

  return <>{glosses}</>;
}
