import { Input, TextField } from "@material-ui/core";
import React, { ReactElement } from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { Gloss } from "api/models";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import { ReviewEntriesSense } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { themeColors } from "types/theme";
import { newGloss } from "types/word";

interface GlossCellProps {
  editable?: boolean;
  sortingByThis?: boolean;
}

export default function GlossCell(
  props: FieldParameterStandard & GlossCellProps
): ReactElement {
  const analysisLang = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems[0].bcp47
  );

  return (
    <AlignedList
      listId={`senses${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, index) =>
        props.editable ? (
          <GlossList
            glosses={sense.glosses}
            defaultLang={analysisLang}
            keyPrefix={`row-${props.rowData.id}-gloss`}
            onChange={(glosses) =>
              props.onRowDataChange &&
              props.onRowDataChange({
                ...props.rowData,
                senses: [
                  ...props.rowData.senses.slice(0, index),
                  {
                    ...sense,
                    glosses,
                  },
                  ...props.rowData.senses.slice(index + 1),
                ],
              })
            }
          />
        ) : (
          <Translate>
            {({ translate }): ReactElement => (
              <Input
                fullWidth
                key={`glosses${props.rowData.id}`}
                value={ReviewEntriesSense.glossString(props.value[index])}
                placeholder={translate("reviewEntries.noGloss").toString()}
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
      bottomCell={props.editable ? SPACER : undefined}
    />
  );
}

interface GlossListProps {
  glosses: Gloss[];
  defaultLang: string;
  keyPrefix: string;
  onChange: (glosses: Gloss[]) => void;
}

function GlossList(props: GlossListProps): ReactElement {
  const langs = props.glosses.map((g) => g.language);
  if (!langs.includes(props.defaultLang)) {
    props.onChange([...props.glosses, newGloss("", props.defaultLang)]);
  }

  return (
    <React.Fragment>
      {props.glosses.map((g, i) => (
        <GlossField
          gloss={g}
          key={`${props.keyPrefix}-${i}`}
          textFieldId={`${props.keyPrefix}-${i}-text`}
          onChange={(gloss: Gloss) => {
            const updatedGlosses = [...props.glosses];
            updatedGlosses.splice(i, 1, gloss);
            props.onChange(updatedGlosses);
          }}
        />
      ))}
    </React.Fragment>
  );
}

interface GlossFieldProps {
  gloss: Gloss;
  textFieldId: string;
  onChange: (gloss: Gloss) => void;
}

function GlossField(props: GlossFieldProps): ReactElement {
  return (
    <TextField
      id={props.textFieldId}
      label={`${props.gloss.language}:`}
      variant="outlined"
      margin="dense"
      multiline
      value={props.gloss.def}
      error={props.gloss.def.length === 0}
      onChange={(event) =>
        props.onChange({
          language: props.gloss.language,
          def: event.target.value,
        })
      }
    />
  );
}
