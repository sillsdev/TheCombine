import React from "react";
import { Grid } from "@material-ui/core";
import { TranslateFunction } from "react-localize-redux";
import { NewVernEntry } from "./NewVernEntry.tsx/NewVernEntry";
import { NewGlossEntry } from "./NewGlossEntry.tsx/NewGlossEntry";
import { Row } from "../Table/DataEntryTable";

interface NewEntryProps {
  row: Row;
  rowIndex: number;
  vernInput: React.RefObject<HTMLDivElement>;
  glossInput: React.RefObject<HTMLDivElement>;
  vernInFrontier: (vernacular: string) => string;
  isSpelledCorrectly: (gloss: string) => boolean;
  updateRow: (row: Row, index: number, callback?: Function) => void;
  focusGlossInput: () => void;
  focusVernInput: () => void;
  toggleDuplicateVernacularView: (rowIndex: number) => void;
  toggleSpellingSuggestionsView: (rowIndex: number) => void;
  translate: TranslateFunction;
}

export class NewEntry extends React.Component<NewEntryProps> {
  render() {
    return (
      <React.Fragment>
        <Grid item xs={12}>
          <Grid container>
            <NewVernEntry
              row={this.props.row}
              rowIndex={this.props.rowIndex}
              vernInput={this.props.vernInput}
              vernInFrontier={this.props.vernInFrontier}
              updateRow={this.props.updateRow}
              focusGlossInput={this.props.focusGlossInput}
              toggleDuplicateVernacularView={
                this.props.toggleDuplicateVernacularView
              }
              translate={this.props.translate}
            />
            <NewGlossEntry
              row={this.props.row}
              rowIndex={this.props.rowIndex}
              glossInput={this.props.glossInput}
              isSpelledCorrectly={this.props.isSpelledCorrectly}
              updateRow={this.props.updateRow}
              focusVernInput={this.props.focusVernInput}
              toggleSpellingSuggestionsView={
                this.props.toggleSpellingSuggestionsView
              }
              translate={this.props.translate}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
