import React from "react";
import { Grid } from "@material-ui/core";
import {
  Translate,
  TranslateFunction,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { ExistingVernEntry } from "./ExistingVernEntry/ExistingVernEntry";
import { ExistingGlossEntry } from "./ExistingGlossEntry/ExistingGlossEntry";
import { DeleteRow } from "./DeleteRow/DeleteRow";

export class ExistingEntry extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Grid container>
          <Grid
            item
            xs={12}
            key={rowIndex}
            onMouseEnter={() => {
              this.setState({ hoverIndex: rowIndex });
            }}
            onMouseLeave={() => {
              this.setState({ hoverIndex: undefined });
            }}
          >
            <ExistingVernEntry />
            <ExistingGlossEntry />

            <Grid item xs={2}>
              {this.state.hoverIndex === rowIndex && <DeleteRow />}
            </Grid>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
