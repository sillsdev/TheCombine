import { Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Gloss, WritingSystem } from "api/models";
import Overlay from "components/Overlay";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { StoreState } from "types";
import { newGloss } from "types/word";
import {
  TextFieldWithFont,
  TypographyWithFont,
} from "utilities/fontComponents";

interface GlossCellProps extends FieldParameterStandard {
  editable?: boolean;
}

export default function GlossCell(props: GlossCellProps): ReactElement {
  const analysisLang = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems[0]
  );

  return (
    <AlignedList
      listId={`senses${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, index) => (
        <Overlay key={index} on={sense.deleted}>
          <GlossList
            defaultLang={analysisLang}
            editable={props.editable && !sense.deleted}
            glosses={sense.glosses}
            idPrefix={`row-${props.rowData.id}-gloss`}
            onChange={(glosses) =>
              props.onRowDataChange &&
              props.onRowDataChange({
                ...props.rowData,
                senses: [
                  ...props.rowData.senses.slice(0, index),
                  { ...sense, glosses },
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

interface GlossListProps {
  defaultLang: WritingSystem;
  editable?: boolean;
  glosses: Gloss[];
  idPrefix: string;
  onChange: (glosses: Gloss[]) => void;
}

function GlossList(props: GlossListProps): ReactElement {
  const { t } = useTranslation();

  if (!props.editable) {
    if (!props.glosses.find((g) => g.def)) {
      return <Typography>{t("reviewEntries.noGloss")}</Typography>;
    }
    return (
      <>
        {props.glosses
          .filter((g) => g.def)
          .map((g, i) => (
            <TypographyWithFont analysis key={i} lang={g.language}>
              {g.def}
            </TypographyWithFont>
          ))}
      </>
    );
  }

  const glosses = props.glosses.find(
    (g) => g.language === props.defaultLang.bcp47
  )
    ? props.glosses
    : [...props.glosses, newGloss("", props.defaultLang.bcp47)];

  return (
    <>
      {glosses.map((g, i) => (
        <GlossField
          gloss={g}
          key={i}
          onChange={(gloss: Gloss) => {
            const updatedGlosses = [...glosses];
            updatedGlosses.splice(i, 1, gloss);
            props.onChange(updatedGlosses);
          }}
          textFieldId={`${props.idPrefix}-${i}-text`}
        />
      ))}
    </>
  );
}

interface GlossFieldProps {
  gloss: Gloss;
  textFieldId: string;
  onChange: (gloss: Gloss) => void;
}

function GlossField(props: GlossFieldProps): ReactElement {
  return (
    <TextFieldWithFont
      id={props.textFieldId}
      label={`${props.gloss.language}:`}
      lang={props.gloss.language}
      variant="outlined"
      margin="dense"
      multiline
      value={props.gloss.def}
      error={props.gloss.def.length === 0}
      onChange={(event) =>
        props.onChange(newGloss(event.target.value, props.gloss.language))
      }
    />
  );
}
