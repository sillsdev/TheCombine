import React from "react";
import { TextField, Grid, Tooltip } from "@material-ui/core";
import theme from "../../../../types/theme";
import { TranslateFunction } from "react-localize-redux";
import { Row } from "../../Table/DataEntryTable";

interface ExistingGlossEntryProps {
  row: Row;
  rowIndex: number;
  isSpelledCorrectly: (gloss: string) => boolean;
  updateRow: (row: Row, index: number, callback?: Function) => void;
  updateWordInFrontAndBack: (rowIndex: number) => Promise<void>;
  focusVernInput: () => void;
  toggleSpellingSuggestionsView: (rowIndex: number) => void;
  translate: TranslateFunction;
}

export class ExistingGlossEntry extends React.Component<
  ExistingGlossEntryProps
> {
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
        {/* Gloss entry */}

        <TextField
          fullWidth
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
            title={this.props.translate("addWords.mispelledWord") as string}
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
                this.props.toggleSpellingSuggestionsView(this.props.rowIndex)
              }
            />
          </Tooltip>
        )}
      </Grid>
    );
  }
}
