import React from "react";
import { TextField, Grid, Tooltip } from "@material-ui/core";
import theme from "../../../../types/theme";

import { Translate, TranslateFunction } from "react-localize-redux";
import { Row } from "../../Table/DataEntryTable";

interface NewVernEntryProps {
  row: Row;
  rowIndex: number;
  vernInput: React.RefObject<HTMLDivElement>;
  vernInFrontier: (vernacular: string) => string;
  updateRow: (row: Row, index: number, callback?: Function) => void;
  focusGlossInput: () => void;
  toggleDuplicateVernacularView: (rowIndex: number) => void;
}

export class NewVernEntry extends React.Component<NewVernEntryProps> {
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
        <TextField
          autoFocus
          label={<Translate id="addWords.vernacular" />}
          fullWidth
          variant="outlined"
          value={this.props.row.vernacular}
          onChange={e => {
            let dupId = this.props.vernInFrontier(e.target.value);
            this.props.updateRow(
              {
                ...this.props.row,
                vernacular: e.target.value,
                dupId: dupId
              },
              this.props.rowIndex
            );
          }}
          inputRef={this.props.vernInput}
          // Move the focus to the next box when the right arrow key is pressed
          onKeyDown={e => {
            if (
              e.key === "ArrowRight" &&
              (e.target as HTMLInputElement).selectionStart ===
                this.props.row.vernacular.length
            )
              this.props.focusGlossInput();
          }}
        />
        {this.props.row.dupId !== "" && (
          <Tooltip
            title={<Translate id="addWords.wordInDatabase" />}
            placement="top"
          >
            <div
              style={{
                height: "5px",
                width: "5px",
                border: "2px solid red",
                borderRadius: "50%",
                position: "absolute",
                top: 24,
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
