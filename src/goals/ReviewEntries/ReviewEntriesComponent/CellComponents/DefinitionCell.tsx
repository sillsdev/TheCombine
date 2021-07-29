import { Input, TextField } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { Definition } from "api/models";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import { ReviewEntriesSense } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { themeColors } from "types/theme";
import { newDefinition } from "types/word";

interface DefinitionCellProps {
  editable?: boolean;
  sortingByThis?: boolean;
}

export default function DefinitionCell(
  props: FieldParameterStandard & DefinitionCellProps
) {
  const analysisLang = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems[0].bcp47
  );

  return (
    <AlignedList
      listId={`senses${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, index) =>
        props.editable ? (
          <DefinitionList
            definitions={sense.definitions}
            defaultLang={analysisLang}
            keyPrefix={`definitions${props.rowData.id}`}
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
        ) : (
          <Translate>
            {({ translate }) => (
              <Input
                fullWidth
                key={`definitions${props.rowData.id}`}
                value={ReviewEntriesSense.definitionString(props.value[index])}
                placeholder={translate("reviewEntries.noDefinition").toString()}
                disabled={sense.deleted}
                readOnly
                disableUnderline
                multiline
                style={
                  props.sortingByThis && index === 0
                    ? { backgroundColor: themeColors.highlight }
                    : {}
                }
              />
            )}
          </Translate>
        )
      )}
      bottomCell={props.editable ? SPACER : null}
    />
  );
}

interface DefinitionListProps {
  definitions: Definition[];
  defaultLang: string;
  keyPrefix: string;
  onChange: (definitions: Definition[]) => void;
}

function DefinitionList(props: DefinitionListProps) {
  const langs = props.definitions.map((g) => g.language);
  if (!langs.includes(props.defaultLang)) {
    props.onChange([
      ...props.definitions,
      newDefinition("", props.defaultLang),
    ]);
  }

  return (
    <React.Fragment>
      {props.definitions.map((g, i) => (
        <DefinitionField
          definition={g}
          key={`${props.keyPrefix}-definition${i}`}
          onChange={(definition: Definition) => {
            const updatedDefinitions = [...props.definitions];
            updatedDefinitions.splice(i, 1, definition);
            props.onChange(updatedDefinitions);
          }}
        />
      ))}
    </React.Fragment>
  );
}

interface DefinitionFieldProps {
  definition: Definition;
  onChange: (definition: Definition) => void;
}

function DefinitionField(props: DefinitionFieldProps) {
  return (
    <TextField
      label={`${props.definition.language}:`}
      variant="outlined"
      margin="dense"
      multiline
      value={props.definition.text}
      error={props.definition.text.length === 0}
      onChange={(event) =>
        props.onChange({
          language: props.definition.language,
          text: event.target.value,
        })
      }
    />
  );
}
