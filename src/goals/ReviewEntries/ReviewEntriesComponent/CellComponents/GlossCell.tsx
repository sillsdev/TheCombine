import { Input, TextField } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { WritingSystem } from "api";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import {
  ReviewEntriesGloss,
  ReviewEntriesSense,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { themeColors } from "types/theme";

interface GlossCellProps extends FieldParameterStandard {
  editable?: boolean;
  sortingByThis?: boolean;
}

export default function GlossCell(props: GlossCellProps): ReactElement {
  const analysisLang = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems[0]
  );
  const { t } = useTranslation();

  return (
    <AlignedList
      listId={`senses${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, index) =>
        props.editable ? (
          <GlossList
            glosses={sense.glosses}
            defaultLang={analysisLang}
            keyPrefix={`row-${props.rowData.id}-gloss`}
            key={`row-${props.rowData.id}-gloss`}
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
          <Input
            fullWidth
            key={`glosses${props.rowData.id}`}
            value={ReviewEntriesSense.glossString(props.value[index])}
            placeholder={t("reviewEntries.noGloss")}
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
        )
      )}
      bottomCell={props.editable ? SPACER : undefined}
    />
  );
}

interface GlossListProps {
  glosses: ReviewEntriesGloss[];
  defaultLang: WritingSystem;
  keyPrefix: string;
  onChange: (glosses: ReviewEntriesGloss[]) => void;
}

function GlossList(props: GlossListProps): ReactElement {
  const langs = props.glosses.map((g) => g.language);
  console.info(props.glosses);
  const glosses = langs.includes(props.defaultLang.bcp47)
    ? props.glosses
    : [
        ...props.glosses,
        new ReviewEntriesGloss("", props.defaultLang.bcp47, [
          props.defaultLang,
        ]),
      ];

  return (
    <>
      {glosses.map((g, i) => (
        <GlossField
          gloss={g}
          key={`${props.keyPrefix}-${i}`}
          textFieldId={`${props.keyPrefix}-${i}-text`}
          onChange={(gloss: ReviewEntriesGloss) => {
            const updatedGlosses = [...glosses];
            updatedGlosses.splice(i, 1, gloss);
            props.onChange(updatedGlosses);
          }}
        />
      ))}
    </>
  );
}

interface GlossFieldProps {
  gloss: ReviewEntriesGloss;
  textFieldId: string;
  onChange: (gloss: ReviewEntriesGloss) => void;
}

function GlossField(props: GlossFieldProps): ReactElement {
  return (
    <TextField
      id={props.textFieldId}
      inputProps={{ style: { fontFamily: props.gloss.font } }}
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
