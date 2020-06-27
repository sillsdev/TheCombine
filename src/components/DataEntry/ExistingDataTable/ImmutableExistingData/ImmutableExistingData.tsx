import React from "react";
import { Grid, TextField } from "@material-ui/core";
import theme from "../../../../types/theme";

interface ImmutableExistingDataProps {
  vernacular: string;
  gloss: string;
}

/**
 * Displays a word users cannot edit any more
 */
export class ImmutableExistingData extends React.Component<
  ImmutableExistingDataProps
> {
  render() {
    return (
      <Grid container wrap={"nowrap"}>
        <Grid
          item
          xs
          key={"vernacular_" + this.props.vernacular}
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
          xs
          key={"gloss_" + this.props.gloss}
          style={{
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            position: "relative",
          }}
        >
          <TextField disabled fullWidth value={this.props.gloss} />
        </Grid>
      </Grid>
    );
  }
}
