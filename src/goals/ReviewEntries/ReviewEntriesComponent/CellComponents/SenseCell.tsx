import React, { ReactNode } from "react";
import { Translate } from "react-localize-redux";
import { TextField, Chip } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { highlight } from "../../../../types/theme";

import { FieldParameterStandard } from "./CellColumns";
import AlignedList from "./AlignedList";
import { uuid } from "../../../../utilities";
import { ReviewEntriesSense } from "../ReviewEntriesTypes";

interface SenseCellProps {
  editable: boolean;
  sortingByGloss: boolean;
}

export default class SenseCell extends React.Component<
  FieldParameterStandard & SenseCellProps
> {
  private inputField(
    sense: ReviewEntriesSense,
    index: number,
    noGloss: string
  ): ReactNode {
    return (
      <TextField
        fullWidth
        key={`glosses${this.props.rowData.id}`}
        value={this.props.value[index].glosses}
        error={sense.glosses.length === 0}
        placeholder={noGloss}
        disabled={sense.deleted}
        InputProps={{
          readOnly: !this.props.editable,
          disableUnderline: !this.props.editable,
          style:
            this.props.sortingByGloss && index === 0
              ? { backgroundColor: highlight }
              : {},
        }}
        // Handles editing sense's local glosses
        onChange={(event) =>
          this.props.onRowDataChange &&
          this.props.onRowDataChange({
            ...this.props.rowData,
            senses: [
              ...this.props.rowData.senses.slice(0, index),
              { ...sense, glosses: event.target.value },
              ...this.props.rowData.senses.slice(
                index + 1,
                this.props.rowData.senses.length
              ),
            ],
          })
        }
      />
    );
  }

  private addSense(): ReactNode {
    return (
      <Chip
        label={<Add />}
        // Handles adding a new local sense
        onClick={() =>
          this.props.onRowDataChange &&
          this.props.onRowDataChange({
            ...this.props.rowData,
            senses: [
              ...this.props.rowData.senses,
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
  render() {
    return (
      <AlignedList
        listId={`senses${this.props.rowData.id}`}
        contents={this.props.rowData.senses.map((sense, index) => (
          <Translate>
            {({ translate }) =>
              this.inputField(
                sense,
                index,
                translate("reviewEntries.nogloss").toString()
              )
            }
          </Translate>
        ))}
        bottomCell={this.props.editable ? this.addSense() : null}
      />
    );
  }
}
