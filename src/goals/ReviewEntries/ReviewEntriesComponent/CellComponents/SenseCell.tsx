import { Chip, Input, TextField } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import React, { ReactNode } from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import AlignedList from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import { ReviewEntriesSense } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { themeColors } from "types/theme";
import { Gloss } from "types/word";
import { uuid } from "utilities";

interface SenseCellProps {
  editable: boolean;
  sortingByGloss: boolean;
}

export default function SenseCell(
  props: FieldParameterStandard & SenseCellProps
) {
  const analysisLang = useSelector(
    (state: StoreState) => state.reviewEntriesState.analysisLanguage
  );

  function addSense(): ReactNode {
    return (
      <Chip
        label={<Add />}
        // Handles adding a new local sense
        onClick={() =>
          props.onRowDataChange &&
          props.onRowDataChange({
            ...props.rowData,
            senses: [
              ...props.rowData.senses,
              {
                deleted: false,
                glosses: [],
                domains: [],
                senseId: uuid(),
              },
            ],
          })
        }
      />
    );
  }

  return (
    <AlignedList
      listId={`senses${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, index) =>
        props.editable ? (
          <GlossList
            glosses={sense.glosses}
            defaultLang={analysisLang}
            keyPrefix={`glosses${props.rowData.id}`}
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
            {({ translate }) => (
              <Input
                fullWidth
                key={`glosses${props.rowData.id}`}
                value={ReviewEntriesSense.glossString(props.value[index])}
                placeholder={translate("reviewEntries.noGloss").toString()}
                disabled={sense.deleted}
                readOnly
                disableUnderline
                style={
                  props.sortingByGloss && index === 0
                    ? { backgroundColor: themeColors.highlight }
                    : {}
                }
              />
            )}
          </Translate>
        )
      )}
      bottomCell={props.editable ? addSense() : null}
    />
  );
}

interface GlossListProps {
  glosses: Gloss[];
  defaultLang: string;
  keyPrefix: string;
  onChange: (glosses: Gloss[]) => void;
}

function GlossList(props: GlossListProps) {
  const hasGlossInDefaultLang = props.glosses
    .map((g) => g.language)
    .includes(props.defaultLang);
  return (
    <React.Fragment>
      {props.glosses.map((g, i) => (
        <GlossField
          gloss={g}
          key={`${props.keyPrefix}-gloss${i}`}
          onChange={(gloss: Gloss) => {
            const updatedGlosses = [...props.glosses];
            updatedGlosses.splice(i, 1, gloss);
            props.onChange(updatedGlosses);
          }}
        />
      ))}
      {
        /* If there's not a gloss in the active analysisLanguage, allow one to be added. */
        !hasGlossInDefaultLang && (
          <GlossField
            gloss={{ def: "", language: props.defaultLang }}
            key={`${props.keyPrefix}-gloss${props.glosses.length}`}
            onChange={(gloss: Gloss) =>
              props.onChange([...props.glosses, gloss])
            }
          />
        )
      }
    </React.Fragment>
  );
}

interface GlossFieldProps {
  gloss: Gloss;
  onChange: (gloss: Gloss) => void;
}

function GlossField(props: GlossFieldProps) {
  return (
    <TextField
      label={`${props.gloss.language}:`}
      variant="outlined"
      margin="dense"
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
