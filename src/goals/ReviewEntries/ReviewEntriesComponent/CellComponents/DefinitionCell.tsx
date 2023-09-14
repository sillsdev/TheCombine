import { Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Definition, WritingSystem } from "api/models";
import Overlay from "components/Overlay";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { StoreState } from "types";
import { newDefinition } from "types/word";
import {
  TextFieldWithFont,
  TypographyWithFont,
} from "utilities/fontComponents";

interface DefinitionCellProps extends FieldParameterStandard {
  editable?: boolean;
  sortingByThis?: boolean;
}

export default function DefinitionCell(
  props: DefinitionCellProps
): ReactElement {
  const analysisLang = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems[0]
  );

  return (
    <AlignedList
      listId={`senses${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, index) => (
        <Overlay key={index} on={sense.deleted}>
          <DefinitionList
            defaultLang={analysisLang}
            definitions={sense.definitions}
            editable={props.editable && !sense.deleted}
            idPrefix={`row-${props.rowData.id}-definition`}
            onChange={(definitions) =>
              props.onRowDataChange &&
              props.onRowDataChange({
                ...props.rowData,
                senses: [
                  ...props.rowData.senses.slice(0, index),
                  {
                    ...sense,
                    definitions,
                  },
                  ...props.rowData.senses.slice(index + 1),
                ],
              })
            }
          />
        </Overlay>
      ))}
      bottomCell={props.editable ? SPACER : undefined}
    />
  );
}

interface DefinitionListProps {
  defaultLang: WritingSystem;
  definitions: Definition[];
  editable?: boolean;
  idPrefix: string;
  onChange: (definitions: Definition[]) => void;
}

function DefinitionList(props: DefinitionListProps): ReactElement {
  const { t } = useTranslation();

  if (!props.editable) {
    if (!props.definitions.find((d) => d.text)) {
      return <Typography>{t("reviewEntries.noDefinition")}</Typography>;
    }
    return (
      <>
        {props.definitions
          .filter((d) => d.text)
          .map((d, i) => (
            <TypographyWithFont analysis key={i} lang={d.language}>
              {d.text}
            </TypographyWithFont>
          ))}
      </>
    );
  }

  const definitions = props.definitions.find(
    (d) => d.language === props.defaultLang.bcp47
  )
    ? props.definitions
    : [...props.definitions, newDefinition("", props.defaultLang.bcp47)];

  return (
    <>
      {definitions.map((d, i) => (
        <DefinitionField
          definition={d}
          key={i}
          onChange={(definition: Definition) => {
            const updatedDefinitions = [...definitions];
            updatedDefinitions.splice(i, 1, definition);
            props.onChange(updatedDefinitions);
          }}
          textFieldId={`${props.idPrefix}-${i}-text`}
        />
      ))}
    </>
  );
}

interface DefinitionFieldProps {
  definition: Definition;
  textFieldId: string;
  onChange: (definition: Definition) => void;
}

function DefinitionField(props: DefinitionFieldProps): ReactElement {
  return (
    <TextFieldWithFont
      id={props.textFieldId}
      label={`${props.definition.language}:`}
      lang={props.definition.language}
      variant="outlined"
      margin="dense"
      multiline
      value={props.definition.text}
      error={props.definition.text.length === 0}
      onChange={(event) =>
        props.onChange(
          newDefinition(event.target.value, props.definition.language)
        )
      }
    />
  );
}
