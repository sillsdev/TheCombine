import { TextField, Chip } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import React, { ReactNode } from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import AlignedList from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import { ReviewEntriesSense } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { themeColors } from "types/theme";

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

  function inputField(
    sense: ReviewEntriesSense,
    index: number,
    noGloss: string
  ): ReactNode {
    return (
      <TextField
        fullWidth
        key={`glosses${props.rowData.id}`}
        value={ReviewEntriesSense.glossString(props.value[index])}
        error={sense.glosses.length === 0}
        placeholder={noGloss}
        disabled={sense.deleted}
        InputProps={{
          readOnly: !props.editable,
          disableUnderline: !props.editable,
          style:
            props.sortingByGloss && index === 0
              ? { backgroundColor: themeColors.highlight }
              : {},
        }}
        // Handles editing sense's local glosses
        onChange={(event) =>
          props.onRowDataChange &&
          props.onRowDataChange({
            ...props.rowData,
            senses: [
              ...props.rowData.senses.slice(0, index),
              {
                ...sense,
                /* The way things are now, if we enable loading glosses from all langauges into ReviewEntries,
                 * editing a sense may overwrite all its glosses' languages with the active analysisLanguage.
                 */
                glosses: ReviewEntriesSense.glossesFromString(
                  event.target.value,
                  analysisLang
                ),
              },
              ...props.rowData.senses.slice(index + 1),
            ],
          })
        }
      />
    );
  }

  function addSense(): ReactNode {
    return (
      <Chip
        label={<Add />}
        // Handles adding a new local sense
        onClick={() =>
          props.onRowDataChange &&
          props.onRowDataChange({
            ...props.rowData,
            senses: [...props.rowData.senses, new ReviewEntriesSense()],
          })
        }
      />
    );
  }

  // Create the sense edit fields
  return (
    <AlignedList
      listId={`senses${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, index) => (
        <Translate>
          {({ translate }) =>
            inputField(
              sense,
              index,
              translate("reviewEntries.noGloss").toString()
            )
          }
        </Translate>
      ))}
      bottomCell={props.editable ? addSense() : null}
    />
  );
}
