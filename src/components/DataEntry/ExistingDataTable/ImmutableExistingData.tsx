import { Grid, Typography } from "@material-ui/core";
import React from "react";

interface ImmutableExistingDataProps {
  vernacular?: string;
  gloss?: string;
}

/**
 * Displays a word users cannot edit any more
 */
export class ImmutableExistingData extends React.Component<ImmutableExistingDataProps> {
  render() {
    return (
      <Grid container wrap="nowrap" justifyContent="space-around">
        <Grid
          item
          xs={5}
          key={"vernacular_" + this.props.vernacular}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">{this.props.vernacular}</Typography>
        </Grid>
        <Grid
          item
          xs={5}
          key={"gloss_" + this.props.gloss}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">{this.props.gloss}</Typography>
        </Grid>
      </Grid>
    );
  }
}
