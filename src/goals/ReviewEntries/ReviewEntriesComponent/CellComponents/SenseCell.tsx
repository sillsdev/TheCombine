import React, { ReactNode } from "react";
import { Translate } from "react-localize-redux";
import { TextField, Chip } from "@material-ui/core";
import { Add } from "@material-ui/icons";

import { highlight } from "types/theme";
import { FieldParameterStandard } from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import AlignedList from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { uuid } from "utilities";
import { ReviewEntriesSense } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

interface SenseCellProps {
  editable: boolean;
  sortingByGloss: boolean;
}

export default function SenseCell(
  props: FieldParameterStandard & SenseCellProps
) {
  function inputField(
    sense: ReviewEntriesSense,
    index: number,
    noGloss: string
  ): ReactNode {
    return (
      <TextField
        fullWidth
        key={`glosses${props.rowData.id}`}
        value={props.value[index].glosses}
        error={sense.glosses.length === 0}
        placeholder={noGloss}
        disabled={sense.deleted}
        InputProps={{
          readOnly: !props.editable,
          disableUnderline: !props.editable,
          style:
            props.sortingByGloss && index === 0
              ? { backgroundColor: highlight }
              : {},
        }}
        // Handles editing sense's local glosses
        onChange={(event) =>
          props.onRowDataChange &&
          props.onRowDataChange({
            ...props.rowData,
            senses: [
              ...props.rowData.senses.slice(0, index),
              { ...sense, glosses: event.target.value },
              ...props.rowData.senses.slice(
                index + 1,
                props.rowData.senses.length
              ),
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
            senses: [
              ...props.rowData.senses,
              {
                deleted: false,
                glosses: "",
                domains: [],
                senseId: uuid(),
              },
            ],
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
