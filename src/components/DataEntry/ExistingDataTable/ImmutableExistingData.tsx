import { Grid, Typography } from "@mui/material";
import { ReactElement } from "react";

interface ImmutableExistingDataProps {
  vernacular: string;
  gloss: string;
}

/**
 * Displays a word users cannot edit any more
 */
export default function ImmutableExistingData(
  props: ImmutableExistingDataProps
): ReactElement {
  return (
    <Grid container wrap="nowrap" justifyContent="space-around">
      <Grid
        item
        xs={5}
        key={"vernacular_" + props.vernacular}
        style={{
          borderBottomStyle: "dotted",
          borderBottomWidth: 1,
          position: "relative",
        }}
      >
        <Typography variant="body1">{props.vernacular}</Typography>
      </Grid>
      <Grid
        item
        xs={5}
        key={"gloss_" + props.gloss}
        style={{
          borderBottomStyle: "dotted",
          borderBottomWidth: 1,
          position: "relative",
        }}
      >
        <Typography variant="body1">{props.gloss}</Typography>
      </Grid>
    </Grid>
  );
}
