import React from "react";
import { TextField, Grid, Tooltip } from "@material-ui/core";
import theme from "../../../../types/theme";

import { Translate, TranslateFunction } from "react-localize-redux";
import { Row } from "../../Table/DataEntryTable";

interface NewGlossEntryProps {
  row: Row;
  rowIndex: number;
  glossInput: React.RefObject<HTMLDivElement>;
  isSpelledCorrectly: (gloss: string) => boolean;
  updateRow: (row: Row, index: number, callback?: Function) => void;
  focusVernInput: () => void;
  toggleSpellingSuggestionsView: (rowIndex: number) => void;
}

export class NewGlossEntry extends React.Component<NewGlossEntryProps> {
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
        {/* Gloss new word entry */}

        <TextField
          label={<Translate id="addWords.glosses" />}
          fullWidth
          variant="outlined"
          value={this.props.row.glosses}
          onChange={e => {
            const isSpelledCorrectly = this.props.isSpelledCorrectly(
              e.target.value
            );
            this.props.updateRow(
              {
                ...this.props.row,
                glosses: e.target.value,
                glossSpelledCorrectly: isSpelledCorrectly
              },
              this.props.rowIndex
            );
          }}
          inputRef={this.props.glossInput}
          // Move the focus to the previous box when the left arrow key is pressed
          onKeyDown={e => {
            if (
              e.key === "ArrowLeft" &&
              (e.target as HTMLInputElement).selectionStart === 0
            )
              this.props.focusVernInput();
          }}
          InputProps={
            !this.props.row.glossSpelledCorrectly
              ? {
                  style: {
                    color: "red"
                  }
                }
              : {
                  style: {
                    color: "black"
                  }
                }
          }
        />
        {!this.props.row.glossSpelledCorrectly && (
          <Tooltip
            title={<Translate id="addWords.mispelledWord" />}
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
                this.props.toggleSpellingSuggestionsView(this.props.rowIndex)
              }
            />
          </Tooltip>
        )}
      </Grid>
    );
  }
}
