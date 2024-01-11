import { ReactElement } from "react";
import { useSelector } from "react-redux";

import { Gloss, Word, WritingSystem } from "api/models";
import { StoreState } from "types";
import { TypographyWithFont } from "utilities/fontComponents";

interface GlossesCellProps {
  rowData: Word;
}

export default function GlossesCell(props: GlossesCellProps): ReactElement {
  const analysisLang = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems[0]
  );

  return (
    <>
      {props.rowData.senses.map((sense, i) => (
        <>
          {i ? (
            <TypographyWithFont analysis display="inline">
              {" | "}
            </TypographyWithFont>
          ) : null}
          <GlossList
            defaultLang={analysisLang}
            glosses={sense.glosses}
            idPrefix={`row-${props.rowData.id}-gloss`}
            key={sense.guid}
          />
        </>
      ))}
    </>
  );
}

interface GlossListProps {
  defaultLang: WritingSystem;
  glosses: Gloss[];
  idPrefix: string;
}

function GlossList(props: GlossListProps): ReactElement {
  return (
    <>
      {props.glosses.map((g, i) => (
        <>
          {i ? (
            <TypographyWithFont analysis display="inline">
              {"; "}
            </TypographyWithFont>
          ) : null}
          <TypographyWithFont
            analysis
            display="inline"
            id={`${props.idPrefix}-${i}-text`}
            key={i}
            lang={g.language}
          >
            {g.def}
          </TypographyWithFont>
        </>
      ))}
    </>
  );
}
