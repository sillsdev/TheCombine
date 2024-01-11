import { ReactElement } from "react";
import { useSelector } from "react-redux";

import { Definition, Word, WritingSystem } from "api/models";
import { StoreState } from "types";
import { TypographyWithFont } from "utilities/fontComponents";

interface DefinitionsCellProps {
  rowData: Word;
}

export default function DefinitionsCell(
  props: DefinitionsCellProps
): ReactElement {
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
          <DefinitionList
            defaultLang={analysisLang}
            definitions={sense.definitions}
            idPrefix={`row-${props.rowData.id}-definition`}
            key={sense.guid}
          />
        </>
      ))}
    </>
  );
}

interface DefinitionListProps {
  defaultLang: WritingSystem;
  definitions: Definition[];
  idPrefix: string;
}

function DefinitionList(props: DefinitionListProps): ReactElement {
  return (
    <>
      {props.definitions.map((d, i) => (
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
            lang={d.language}
          >
            {d.text}
          </TypographyWithFont>
        </>
      ))}
    </>
  );
}
