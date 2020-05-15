import React from "react";
import { Grid, TextField } from "@material-ui/core";
import theme from "../../../../types/theme";

interface ImmutableExistingEntryProps {
  vernacular: string;
  gloss: string;
}

/**
 * Displays a word users cannot edit any more
 */
export class ImmutableExistingEntry extends React.Component<
  ImmutableExistingEntryProps
> {
  render() {
    return (
      <Grid item xs={12}>
        <Grid container>
          <Grid
            item
            xs={4}
            key={this.props.vernacular}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative",
            }}
          >
            <TextField disabled fullWidth value={this.props.vernacular} />
          </Grid>
          <Grid
            item
            xs={4}
            key={this.props.gloss}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative",
            }}
          >
            <TextField disabled fullWidth value={this.props.gloss} />
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
