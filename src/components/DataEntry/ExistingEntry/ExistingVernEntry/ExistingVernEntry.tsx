import React from "react";
import { TextField, Grid, Tooltip } from "@material-ui/core";
import theme from "../../../../types/theme";
import { TranslateFunction } from "react-localize-redux";
import { Row } from "../../Table/DataEntryTable";

interface ExistingVernEntryProps {
  row: Row;
  rowIndex: number;
  vernInFrontier: (vernacular: string) => string;
  updateRow: (row: Row, index: number, callback?: Function) => void;
  updateWordInFrontAndBack: (rowIndex: number) => Promise<void>;
  focusVernInput: () => void;
  toggleDuplicateVernacularView: (rowIndex: number) => void;
  translate: TranslateFunction;
}

export class ExistingVernEntry extends React.Component<ExistingVernEntryProps> {
  render() {
    return (
      <Grid
        item
        xs={5}
        style={{
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          position: "relative"
        }}
      >
        {/* Vernacular entry */}

        <TextField
          fullWidth
          value={this.props.row.vernacular}
          onChange={e => {
            let dupId = this.props.vernInFrontier(e.target.value);
            if (dupId === this.props.row.id) {
              console.log("Duplicate is same word");
              dupId = ""; // the "duplicate" is the word we're already editing
            }
            this.props.updateRow(
              {
                ...this.props.row,
                vernacular: e.target.value,
                dupId: dupId
              },
              this.props.rowIndex
            );
          }}
          onBlur={() => {
            this.props
              .updateWordInFrontAndBack(this.props.rowIndex)
              .then(() => console.log("Updated word"));
          }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              this.props.focusVernInput();
            }
          }}
        />
        {this.props.row.dupId !== "" && (
          <Tooltip
            title={this.props.translate("addWords.wordInDatabase") as string}
            placement="top"
          >
            <div
              style={{
                height: "5px",
                width: "5px",
                border: "2px solid red",
                borderRadius: "50%",
                position: "absolute",
                top: 8,
                right: 48,
                cursor: "pointer"
              }}
              onClick={() =>
                this.props.toggleDuplicateVernacularView(this.props.rowIndex)
              }
            />
          </Tooltip>
        )}
      </Grid>
    );
  }
}
